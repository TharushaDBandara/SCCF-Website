# SCCF Website Images

This directory contains all images used in the SCCF website, organized by category for better management and dynamic loading.

## Folder Structure

### 📁 community-development/
Images showcasing community development projects, meetings, and collaborative initiatives.
- **Main display area**: Large focal image in hero grid
- **Recommended size**: 600x400px (3:2 aspect ratio)
- **Examples**: Community meetings, infrastructure projects, village development

### 📁 education/
Images from educational programs, literacy initiatives, and skills training.
- **Display area**: Secondary position in hero grid
- **Recommended size**: 300x300px (square format)
- **Examples**: School programs, adult education, workshops, graduations

### 📁 healthcare/
Images from medical camps, health screenings, and healthcare initiatives.
- **Display area**: Accent position in hero grid  
- **Recommended size**: 300x200px (3:2 aspect ratio)
- **Examples**: Medical camps, vaccinations, health education, facilities

### 📁 environment/
Images from environmental conservation and sustainability projects.
- **Display area**: Feature position in hero grid
- **Recommended size**: 300x250px (6:5 aspect ratio)
- **Examples**: Tree planting, clean water projects, renewable energy, conservation

### 📁 empowerment/
Images from women empowerment and social empowerment programs.
- **Display area**: Small accent position in hero grid
- **Recommended size**: 250x200px (5:4 aspect ratio)
- **Examples**: Skills training, leadership workshops, entrepreneurship, success stories

## Dynamic Image System

The website includes an automatic image shuffling system that:

✨ **Auto-rotates images** every 30 seconds
🔄 **Randomly selects** from available images in each folder
🚀 **Graceful fallbacks** to placeholder images if files are missing
📱 **Responsive design** adapts to all screen sizes
⚡ **Performance optimized** with lazy loading

## Adding New Images

1. **Choose the appropriate folder** based on image content
2. **Follow naming conventions**:
   - Use descriptive, lowercase names
   - Separate words with hyphens
   - Include year if relevant
   - Example: `community-meeting-2024.jpg`

3. **Optimize images before upload**:
   - Compress to reduce file size (aim for under 500KB)
   - Use JPG for photos, PNG for graphics
   - Ensure proper dimensions for best display

4. **Update the image arrays** in `main.js` if you want specific images to show first

## Technical Implementation

The dynamic system is handled by the `HeroImageManager` class in `assets/main.js`:

```javascript
// Add images to a specific category
window.addImagesToCategory('community-development', [
  'assets/images/community-development/new-image.jpg'
]);

// Manually trigger shuffle
window.manualShuffle();

// Change shuffle interval (in seconds)
window.setShuffleInterval(60); // 60 seconds
```

## File Naming Examples

### Community Development
- `community-meeting-2024.jpg`
- `village-development-project.jpg`
- `local-infrastructure-improvement.jpg`
- `collaborative-initiative.jpg`

### Education
- `school-program-primary.jpg`
- `adult-literacy-class.jpg`
- `skills-training-workshop.jpg`
- `graduation-ceremony-2024.jpg`

### Healthcare
- `medical-camp-rural.jpg`
- `vaccination-drive-children.jpg`
- `health-screening-women.jpg`
- `medical-facility-opening.jpg`

### Environment
- `tree-planting-campaign.jpg`
- `clean-water-well-project.jpg`
- `solar-panel-installation.jpg`
- `waste-management-program.jpg`

### Empowerment
- `women-entrepreneurship-training.jpg`
- `leadership-development-workshop.jpg`
- `self-help-group-meeting.jpg`
- `empowerment-success-story.jpg`

---

For technical support or questions about the image system, refer to the main documentation or contact the development team.

Projects:
- project-education.jpg (400x250px) - Children in classroom with educational materials
- project-clean-water.jpg (400x250px) - Community celebrating new water access
- project-healthcare.jpg (400x250px) - Mobile health clinic serving remote village
- project-agriculture.jpg (400x250px) - Farmers with sustainable farming techniques

News:
- news-1.jpg (400x250px) - Students celebrating graduation ceremony
- news-2.jpg (400x250px) - New water well being installed
- news-3.jpg (400x250px) - Volunteers working in community garden

For development purposes, you can use placeholder services like:
- https://picsum.photos/1200/600 for hero banner
- https://picsum.photos/300/300 for team member photos
- https://picsum.photos/400/250 for project and news images

Or use free stock photos from:
- Unsplash (unsplash.com)
- Pexels (pexels.com)
- Pixabay (pixabay.com)
