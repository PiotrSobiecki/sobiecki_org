"""Manual integration check: sends ONE real email. Never run in CI."""
import sys
from playwright.sync_api import sync_playwright, expect

if sys.argv[1:] != ["--send-real-email"]:
    raise SystemExit("Requires --send-real-email and a local server on port 3101 using Google test keys.")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://127.0.0.1:3101", wait_until="networkidle", timeout=60000)
    page.locator("#kontakt").scroll_into_view_if_needed()
    page.locator("#name").fill("Jan Testowy — test Resend")
    page.locator("#email").fill("it@sobiecki.org")
    page.locator("#message").fill(
        "Dzień dobry!\n\nChciałbym zapytać o przygotowanie strony internetowej "
        "dla mojej firmy. Zależy mi na prezentacji usług i formularzu kontaktowym. "
        "Proszę o informację o możliwym terminie realizacji.\n\n"
        "To przykładowa wiadomość wysłana z lokalnej wersji formularza sobiecki.org "
        "w ramach testu integracji Resend. CAPTCHA używa w tym teście "
        "oficjalnych kluczy testowych Google."
    )
    frame = page.frame_locator('iframe[src*="/recaptcha/api2/anchor"]')
    # Only interact with Google's publicly documented testing widget.
    assert "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" in page.locator('iframe[src*="/recaptcha/api2/anchor"]').get_attribute("src")
    frame.locator("#recaptcha-anchor").click()
    expect(frame.locator("#recaptcha-anchor")).to_have_attribute("aria-checked", "true", timeout=15000)
    with page.expect_response(lambda r: r.url.endswith("/api/contact") and r.request.method == "POST", timeout=45000) as result:
        page.get_by_role("button", name="Wyślij wiadomość").click()
    response = result.value
    print("Contact API status:", response.status)
    print("Contact API response:", response.json())
    assert response.status == 200, "Send failed; do not retry without inspecting the cause."
    expect(page.get_by_text("Wiadomość została wysłana!", exact=True)).to_be_visible()
    print("PASS: one example submitted from browser form; Resend accepted the email for it@sobiecki.org")
    browser.close()
