from app.utils.email_cleaner import clean_email_body

def test_clean_html_email():
    raw_html = """
    <html>
        <head><style>body { color: red; }</style></head>
        <body>
            <h1>TCS Placement Drive</h1>
            <p>Registration deadline is Sep 18.</p>
            <script>alert('test');</script>
            <br>
            --<br>
            Thanks and regards,<br>
            Placement Cell
        </body>
    </html>
    """
    cleaned = clean_email_body(raw_html)
    assert "TCS Placement Drive" in cleaned
    assert "Registration deadline is Sep 18." in cleaned
    assert "script" not in cleaned.lower()
    assert "Thanks and regards" not in cleaned

def test_clean_plain_text_with_disclaimer():
    raw_text = """
    Google STEP Internship 2026

    Please attend technical interview on Sep 21 at 2 PM.

    Disclaimer:
    This email and any attachments are confidential.
    """
    cleaned = clean_email_body(raw_text)
    assert "Google STEP Internship 2026" in cleaned
    assert "attend technical interview" in cleaned
    assert "confidential" not in cleaned
