from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto("http://127.0.0.1:3100", wait_until="networkidle")
    page.locator("#projekty").scroll_into_view_if_needed()
    card = page.locator("article").filter(has=page.get_by_role("heading", name="HomeCashflow", exact=True))
    expect(card).to_be_visible()
    expect(card.get_by_role("link")).to_have_attribute("href", "https://homecashflow.org")
    expect(page.get_by_text("Signum Wallet", exact=True)).to_have_count(0)
    page.locator("#kontakt").scroll_into_view_if_needed()
    page.locator("#name").fill("Jan Testowy")
    page.locator("#email").fill("it@sobiecki.org")
    page.locator("#message").fill("Przykładowa wiadomość testowa z formularza sobiecki.org.")
    page.get_by_role("button", name="Wyślij wiadomość").click()
    expect(page.get_by_text("Potwierdź, że nie jesteś robotem.", exact=True)).to_be_visible()
    assert not errors, errors
    print("PASS: HomeCashflow card, Signum removed, form validation, no browser errors")
    browser.close()
