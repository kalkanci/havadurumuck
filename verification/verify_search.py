
from playwright.sync_api import Page, expect, sync_playwright
import time

def test_search_interactions(page: Page):
  # 1. Arrange: Go to the app.
  page.goto("http://localhost:3000")

  # Intercept the search request to delay it, so we can see the spinner
  def handle_route(route):
      time.sleep(2) # Delay by 2 seconds
      route.continue_()

  # The app calls nominatim.openstreetmap.org
  page.route("**/nominatim.openstreetmap.org/search*", handle_route)

  # Wait for input
  search_input = page.get_by_label("Şehir ara")
  expect(search_input).to_be_visible(timeout=10000)

  # 2. Act: Type "Ankara"
  search_input.fill("Ankara")

  # Wait for debounce (500ms) + a little bit
  page.wait_for_timeout(700)

  # Now the request should be in flight (delayed by us), so Loading Spinner should be visible.
  # We look for the spinner. The code has:
  # <div className="absolute right-3 text-blue-500 animate-spin"><Loader2 size={18} /></div>
  # It doesn't have a label, but we can look for the class or the svg.
  # Or we can just screenshot it.

  # Let's take a screenshot of the loading state
  page.screenshot(path="verification/search_loading.png")

  # Verify we DO NOT see the clear button yet
  expect(page.get_by_label("Aramayı temizle")).not_to_be_visible()

  # 3. Wait for the request to complete (it was delayed 2s)
  # We can just wait for the clear button to appear, which happens after loading=false
  clear_btn = page.get_by_label("Aramayı temizle")
  expect(clear_btn).to_be_visible(timeout=5000)

  # Screenshot the cleared state
  page.screenshot(path="verification/search_results.png")

  # 4. Act: Click clear
  clear_btn.click()
  expect(search_input).to_have_value("")

  # Verify MapPin comes back (Current Location button)
  expect(page.get_by_label("Mevcut konumu kullan")).to_be_visible()

  print("Verification successful!")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      test_search_interactions(page)
    finally:
      browser.close()
