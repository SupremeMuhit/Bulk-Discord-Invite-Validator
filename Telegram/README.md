# Telegram Link Validator

A modern web application to validate Telegram links in bulk or individually.

## Features

- **Bulk Validation**: Check multiple Telegram links at once
- **Single Detailed Mode**: Get detailed information about individual links
- **Multiple Format Support**:
  - `t.me/username`
  - `@username`
  - `https://t.me/joinchat/xxxxx`
  - `tl-user/username`
  - `tl-group/groupname`
  - `tl-channel/channelname`
- **Real-time Statistics**: Track entered, checked, valid, and invalid links
- **Copy Invalid Links**: Easily copy all invalid links for re-checking

## How to Use

1. Open `telegram-validator.html` in your web browser
2. Choose between **Bulk Validator** or **Single Detailed** mode
3. Enter your Telegram links:
   - For bulk mode: One link per line
   - For single mode: One link in the input field
4. Click "Check Links" or "Validate"
5. View results organized by valid/invalid/error status

## Link Format Examples

```
t.me/example_channel
@example_user
https://t.me/joinchat/AaBbCcDdEe
tl-user/example_user
tl-group/example_group
tl-channel/example_channel
```

## Technical Details

- Pure HTML, CSS, and JavaScript (no dependencies)
- Client-side validation
- Telegram-themed design (blue color scheme)
- Responsive layout
- Font Awesome icons for visual clarity

## Validation Rules

- Usernames must be at least 5 characters
- Usernames must start with a letter
- Usernames can only contain letters, numbers, and underscores
- Invite links must have valid format

## Note

This validator performs format validation. For real-time availability checking, you would need access to Telegram's API or scraping solutions.

## Credits

Created by **SupremeMuhit**

---

Made with ❤️
