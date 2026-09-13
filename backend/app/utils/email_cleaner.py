import re
from bs4 import BeautifulSoup

def clean_email_body(raw_body: str) -> str:
    """
    Cleans raw email content by removing HTML markup, CSS scripts, signatures,
    disclaimer footers, and redundant line breaks.
    """
    if not raw_body or not raw_body.strip():
        return ""

    # Parse HTML with BeautifulSoup if HTML tags exist
    if "<html" in raw_body.lower() or "<div" in raw_body.lower() or "<p" in raw_body.lower() or "<br" in raw_body.lower():
        soup = BeautifulSoup(raw_body, "html.parser")
        
        # Remove script and style elements
        for element in soup(["script", "style", "head", "footer", "meta"]):
            element.decompose()
            
        text = soup.get_text(separator="\n")
    else:
        text = raw_body

    lines = [line.strip() for line in text.splitlines()]
    cleaned_lines = []
    
    # Common signature & disclaimer cutoff markers
    cutoff_patterns = [
        r"^--\s*$",
        r"^thanks\s+and\s+regards",
        r"^best\s+regards",
        r"^warm\s+regards",
        r"^this\s+email\s+and\s+any\s+attachments\s+are\s+confidential",
        r"^disclaimer:",
        r"^unsubscribe",
        r"^click\s+here\s+to\s+unsubscribe",
    ]

    for line in lines:
        if not line:
            continue
            
        # Check if line matches any signature cutoff pattern
        line_lower = line.lower()
        should_cutoff = False
        for pattern in cutoff_patterns:
            if re.search(pattern, line_lower):
                should_cutoff = True
                break
                
        if should_cutoff:
            break
            
        cleaned_lines.append(line)

    result = "\n".join(cleaned_lines)
    # Collapse multiple newlines into maximum 2
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()
