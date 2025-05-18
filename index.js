import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );
    
    
    await page.goto('https://internshala.com/registration/student', {
        waitUntil: 'networkidle2',
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
    await page.waitForSelector('#login-link-container span', { visible: true });
await page.click('#login-link-container span');

    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // await page.type('#modal_email', 'arinbalyan2004@gmail.com');
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // await page.type('#modal_password', 'arinisgreat');
    await page.type('#modal_email', 'arinbalyan2004@gmail.com', { delay: 96 });
    await new Promise((resolve) => setTimeout(resolve, 1512));
await page.type('#modal_password', 'arinisgreat', { delay: 112 });

    await page.click('#modal_login_submit');
    await new Promise((resolve) => setTimeout(resolve, 5067));
    
    // Step 2: Go to matching preferences page
    await page.goto('https://internshala.com/internships/matching-preferences/', {
        waitUntil: 'networkidle2',
    });
    
    // Wait for page to load completely
    await new Promise((resolve) => setTimeout(resolve, 5030));
    
    try {
        // Step 3: Uncheck the preferences checkbox if checked
        const isChecked = await page.evaluate(() => {
            const checkbox = document.getElementById('matching_preference');
            return checkbox && checkbox.checked;
        });
        
        if (isChecked) {
            await page.click('#matching_preference');
            console.log('Checkbox unchecked successfully');
            // Add a longer delay after unchecking to allow page to update
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        
        // Step 4: Target the dropdown element more precisely
        console.log('Looking for dropdown element...');
        
        // Use a more specific selector based on the HTML structure
        await page.waitForSelector('#select_category_chosen', { visible: true, timeout: 10000 });
        console.log('Found the dropdown container');
        
        // Click the dropdown to open it
        await page.click('#select_category_chosen');
        console.log('Clicked dropdown to open it');
        
        // Wait for the dropdown choices to appear
        await page.waitForSelector('.chosen-results .active-result', { visible: true, timeout: 5000 });
        console.log('Dropdown options appeared');
        
        // Wait a moment for the dropdown to fully open
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Now click on the Animation option (data-option-array-index="11")
        await page.waitForSelector('li.active-result[data-option-array-index="157"]', { visible: true, timeout: 5000 });
        await page.click('li.active-result[data-option-array-index="157"]');
        console.log('Animation option selected successfully');
        
        // Wait to see the result
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
       
        const selectedOptions = await page.evaluate(() => {
            const selections = document.querySelectorAll('.search-choice span');
            return Array.from(selections).map(el => el.textContent);
        });
        
        console.log('Selected options:', selectedOptions);
        
    } catch (error) {
        console.error('Error occurred:', error);
        
       
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('Saved error screenshot to error-screenshot.png');
    }
    
   
    console.log('Script completed - browser left open for debugging');

const internshipIds = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.individual_internship'));
    
    return elements
        .filter(el => {
            const isHidden = window.getComputedStyle(el).display === 'none';
            const hasId = el.id?.startsWith('individual_internship_');
            return !isHidden && hasId;
        })
        .map(el => el.id);
});
console.log(internshipIds);
for (let i = 0; i < Math.min(5, internshipIds.length); i++) {
    const internshipSelector = `#${internshipIds[i]}`;
    
    // Scroll into view to ensure visibility
    await page.evaluate(selector => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, internshipSelector);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Click the card (assumes it opens the internship page)
    await page.click(internshipSelector);
    new Promise((resolve) => {
      setTimeout(resolve,3069)  
    })
    console.log(`Clicked on internship: ${internshipIds[i]}`);
   
}

 //  await browser.close(); 
})();