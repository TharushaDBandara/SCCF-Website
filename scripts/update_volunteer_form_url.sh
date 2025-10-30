#!/bin/bash
# Script to update Google Form URL for volunteer registration
# Usage: ./update_volunteer_form_url.sh "your-google-form-url"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"https://forms.google.com/d/your-form-id/viewform\""
    echo "Please provide your Google Form URL as an argument"
    exit 1
fi

NEW_URL="$1"
FILE_PATH="index.html"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: $FILE_PATH not found"
    exit 1
fi

# Update the URL in the file
sed -i "s|href=\"https://forms\.google\.com/your-volunteer-form-id\"|href=\"$NEW_URL\"|g" "$FILE_PATH"

echo "✅ Updated volunteer form URL in $FILE_PATH"
echo "New URL: $NEW_URL"
echo ""
echo "Next steps:"
echo "1. Open your website"
echo "2. Go to the 'Get Involved' section"
echo "3. Click 'Fill Volunteer Application' to test"