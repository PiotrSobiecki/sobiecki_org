from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.add_init_script("""
        window.gameSignals = [];
        const add = document.addEventListener.bind(document);
        document.addEventListener = function(type, listener, options) {
            if (['mousemove', 'mouseup'].includes(type) && options?.signal) window.gameSignals.push(options.signal);
            return add(type, listener, options);
        };
    """)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    # CSP nie zglasza sie przez pageerror - blokada widac tylko w konsoli.
    csp_blocks = []
    page.on("console", lambda msg: csp_blocks.append(msg.text)
            if "Content Security Policy" in msg.text else None)
    # Nasze obrazy i wideo hostujemy u siebie. gstatic zostaje: to logo i font
    # samego widgetu reCAPTCHA, ktorych nie da sie przejac bez zepsucia go.
    allowed = ("127.0.0.1:3100", "gstatic.com")
    foreign = []
    page.on("request", lambda req: foreign.append(req.url)
            if req.resource_type in ("image", "media", "font")
            and not any(host in req.url for host in allowed)
            else None)
    page.goto("http://127.0.0.1:3100", wait_until="networkidle")

    # Tlo hero ma plakat, a tlo sekcji projektow nie pobiera sie przed kadrem.
    hero_video = page.locator("section.hero video")
    expect(hero_video).to_have_attribute("preload", "none")
    expect(hero_video).to_have_attribute("poster", "/images/coding-poster.jpg")
    section_video = page.locator("video.section-bg-video")
    expect(section_video).to_have_attribute("poster", "/images/kafelek-poster.jpg")
    assert section_video.evaluate("v => v.getAttribute('src') === null")

    page.locator("#projekty").scroll_into_view_if_needed()
    page.wait_for_function(
        "() => document.querySelector('video.section-bg-video')?.src.endsWith('/images/kafelek.mp4')"
    )
    card = page.locator("article").filter(has=page.get_by_role("heading", name="HomeCashflow", exact=True))
    expect(card).to_be_visible()
    expect(card.get_by_role("link")).to_have_attribute("href", "https://homecashflow.org")
    expect(card).to_contain_text("sterowanie inteligentnymi wtyczkami i urządzeniami")
    expect(page.get_by_text("Signum Wallet", exact=True)).to_have_count(0)
    expect(page.locator('link[rel="canonical"]')).to_have_attribute("href", "https://sobiecki.org")
    expect(page.locator('meta[name="description"]')).to_have_count(1)
    expect(page.locator('meta[property="og:image"]')).to_have_attribute("content", "https://sobiecki.org/images/og-cover.jpg")
    robots = page.request.get("http://127.0.0.1:3100/robots.txt")
    assert robots.status == 200 and "Sitemap: https://sobiecki.org/sitemap.xml" in robots.text()
    sitemap = page.request.get("http://127.0.0.1:3100/sitemap.xml")
    assert sitemap.status == 200 and "https://sobiecki.org/polityka-prywatnosci" in sitemap.text()
    page.locator("#uslugi").scroll_into_view_if_needed()
    accents = page.locator(".service-card__accent")
    expect(accents).to_have_count(3)
    for i, name in enumerate(["uslugi-web", "uslugi-blockchain", "uslugi-boty"]):
        assert f"/images/{name}.jpg" in accents.nth(i).evaluate("e => e.style.backgroundImage")
        assert page.request.get(f"http://127.0.0.1:3100/images/{name}.jpg").status == 200
    assert not foreign, foreign
    page.locator("#kontakt").scroll_into_view_if_needed()
    page.locator("#name").fill("Jan Testowy")
    page.locator("#email").fill("it@sobiecki.org")
    page.locator("#message").fill("Przykładowa wiadomość testowa z formularza sobiecki.org.")
    page.get_by_role("button", name="Wyślij wiadomość").click()
    expect(page.get_by_text("Potwierdź, że nie jesteś robotem.", exact=True)).to_be_visible()

    # Each game owns its canvas and its document listeners.
    page.evaluate("window.openMinesweeper(); window.openMinesweeper();")
    canvases = page.locator("[data-minesweeper-canvas]")
    expect(canvases).to_have_count(2)
    first_before = canvases.nth(0).evaluate("c => c.toDataURL()")
    second_before = canvases.nth(1).evaluate("c => c.toDataURL()")
    canvases.nth(1).click(button="right", position={"x": 15, "y": 15})
    assert canvases.nth(0).evaluate("c => c.toDataURL()") == first_before
    assert canvases.nth(1).evaluate("c => c.toDataURL()") != second_before
    page.get_by_role("button", name="Zamknij Sapera").nth(1).click()
    expect(canvases).to_have_count(1)
    assert page.evaluate("gameSignals.length === 4 && gameSignals.slice(2).every(s => s.aborted)")

    # Menu is inert while closed, traps focus when open, and restores it on Escape.
    page.set_viewport_size({"width": 390, "height": 844})
    menu = page.locator("#mobile-menu")
    assert menu.evaluate("e => e.inert")
    trigger = page.get_by_role("button", name="Otwórz menu")
    trigger.click()
    close = page.get_by_role("button", name="Zamknij menu", exact=True)
    expect(close).to_be_focused()
    page.keyboard.press("Shift+Tab")
    expect(menu.get_by_role("link", name="Skontaktuj się")).to_be_focused()
    page.keyboard.press("Tab")
    expect(close).to_be_focused()
    page.keyboard.press("Escape")
    expect(trigger).to_be_focused()
    assert menu.evaluate("e => e.inert")
    assert page.evaluate("document.body.style.overflowY !== 'hidden'")

    page.locator('a[href="/polityka-prywatnosci"]').click()
    expect(page.get_by_role("heading", name="Polityka prywatności", exact=True)).to_be_visible()
    expect(page.locator('link[rel="canonical"]')).to_have_attribute("href", "https://sobiecki.org/polityka-prywatnosci")
    expect(page.locator("[data-minesweeper-canvas]")).to_have_count(0)
    assert page.evaluate("gameSignals.every(s => s.aborted)")
    assert not csp_blocks, csp_blocks
    headers = page.request.get("http://127.0.0.1:3100/").headers
    for key in ("content-security-policy", "strict-transport-security", "x-content-type-options",
                "x-frame-options", "referrer-policy", "permissions-policy"):
        assert key in headers, key
    assert "frame-ancestors 'none'" in headers["content-security-policy"]
    assert not errors, errors
    print("PASS: project content, SEO, CAPTCHA guard, independent games and listener cleanup, keyboard menu, local images, no browser errors")
    browser.close()
