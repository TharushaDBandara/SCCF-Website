# Google Forms Integration Setup

## 📋 Forms to Create

### 1. Volunteer Registration Form
Create at: [forms.google.com](https://forms.google.com)

**Form Title:** SCCF Volunteer Registration

**Fields to Add:**
- **Full Name** (Short answer, Required)
- **Email Address** (Short answer, Required, Email validation)
- **Phone Number** (Short answer, Optional)
- **Skills/Interests** (Paragraph, Required)
- **Availability** (Multiple choice: Weekdays, Weekends, Both, Flexible)
- **Previous Volunteer Experience** (Paragraph, Optional)
- **How did you hear about us?** (Multiple choice: Website, Social Media, Friend, Other)

### 2. Contact Us Form
Create another form at: [forms.google.com](https://forms.google.com)

**Form Title:** SCCF Contact Form

**Fields to Add:**
- **Name** (Short answer, Required)
- **Email Address** (Short answer, Required, Email validation)
- **Subject** (Short answer, Required)
- **Message** (Paragraph, Required)
- **Preferred Contact Method** (Multiple choice: Email, Phone, No preference)

## 🔔 Enable Email Notifications

For **BOTH** forms:
1. Click the **"Responses"** tab
2. Click the **3 dots menu (⋮)** 
3. Select **"Get email notifications for new responses"**
4. You'll receive an email every time someone submits

## 📊 View Responses

- Responses are automatically saved to Google Sheets
- Access via the **"Responses"** tab in each form
- You can download responses as Excel files

## 🔗 Get Embed Codes

For **EACH** form:
1. Click the **"Send"** button (top right)
2. Click the **"< >"** (embed) icon
3. **Copy the iframe code**
4. Replace the placeholder URLs in your HTML:

### Volunteer Form:
Replace `PASTE_YOUR_VOLUNTEER_FORM_EMBED_URL_HERE` in `index.html` with your volunteer form embed URL

### Contact Form:
Replace `PASTE_YOUR_CONTACT_FORM_EMBED_URL_HERE` in `index.html` with your contact form embed URL

## ✅ Final Steps

1. **Create both forms** with the fields listed above
2. **Enable email notifications** for both forms
3. **Get embed codes** from both forms
4. **Update index.html** with the actual embed URLs
5. **Test the forms** to ensure they work properly

## 🎨 Customization Options

Your forms will automatically match your website's styling. You can also:
- Customize form colors in Google Forms to match your brand
- Add your logo to the forms
- Create custom thank you messages

## 📧 What You'll Receive

When someone submits:
- **Instant email notification** with all form data
- **Automatic spreadsheet entry** with timestamp
- **Organized data** for easy management

## 🔧 Troubleshooting

If forms don't display:
- Check that you pasted the correct embed URL
- Ensure the form sharing settings allow public access
- Clear your browser cache and reload

---

**Need Help?** 
- [Google Forms Help Center](https://support.google.com/docs/topic/9054603)
- Test your forms before going live
