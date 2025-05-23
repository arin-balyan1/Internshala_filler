import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
let submission_detail=[];
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    page.setDefaultNavigationTimeout(30000);

    await page.goto('https://internshala.com/registration/student', { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 2000));

    await page.waitForSelector('#login-link-container span', { visible: true });
    await page.click('#login-link-container span');
    await new Promise(res => setTimeout(res, 2000));

    await page.type('#modal_email', 'arinbalyan2004@gmail.com', { delay: 96 });
    await new Promise(res => setTimeout(res, 1512));
    await page.type('#modal_password', 'arinisgreat', { delay: 112 });
    await page.click('#modal_login_submit');
    await new Promise(res => setTimeout(res, 5067));

    await page.goto('https://internshala.com/internships/matching-preferences/', {
        waitUntil: 'networkidle2',
    });

    await new Promise(res => setTimeout(res, 5000));

    try {
        const isChecked = await page.evaluate(() => {
            const checkbox = document.getElementById('matching_preference');
            return checkbox && checkbox.checked;
        });

        if (isChecked) {
            await page.click('#matching_preference');
            console.log('Checkbox unchecked successfully');
            await new Promise(res => setTimeout(res, 3000));
        }

        await page.waitForSelector('#select_category_chosen', { visible: true, timeout: 10000 });
        await page.click('#select_category_chosen');
        await page.waitForSelector('.chosen-results .active-result', { visible: true, timeout: 5000 });
        await new Promise(res => setTimeout(res, 1000));
        await page.click('li.active-result[data-option-array-index="157"]');
        await new Promise(res => setTimeout(res, 3000));
    } catch (error) {
        console.error('Error occurred:', error);
        await page.screenshot({ path: 'error-screenshot.png' });
    }


const internshipData = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.individual_internship'));
    return elements
        .filter(el => {
            const isHidden = window.getComputedStyle(el).display === 'none';
            const hasId = el.id?.startsWith('individual_internship_');
            return !isHidden && hasId;
        })
        .map(el => {
            // Corrected selector - using job-title-href instead of job-title-herf
            const linkElement = el.querySelector('a.job-title-href');
            return {
                id: el.id,
                href: linkElement ? linkElement.getAttribute('href') : null,
                fullUrl: linkElement ? `https://internshala.com${linkElement.getAttribute('href')}` : null,
                title: linkElement ? linkElement.textContent.trim() : null,
                company: el.querySelector('.company-name')?.textContent.trim() || null
            };
        });
});

console.log('Found internships:', internshipData);

let no_of_submission = Math.min(5, internshipData.length);

for (let i = 0; i < no_of_submission; i++) {
    let urllink = internshipData[i].fullUrl;

    await page.goto(urllink, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.internship_details', { timeout: 5000 }).catch(() => {});
    await new Promise(res => setTimeout(res, 1000));
    try {
    await page.waitForSelector('a > button.top_apply_now_cta', { visible: true });
await page.click('a > button.top_apply_now_cta');

    console.log('Clicked Apply Now button.');
    submission_detail.push({title:internshipData[i].title,company:internshipData[i].company});
    await page.waitForSelector('button.proceed-btn', { visible: true });
   await page.click('button.proceed-btn');

 await new Promise((res)=>{setTimeout(res,5000)});
    await page.waitForSelector('#radio1', { visible: true });
await page.click('#radio1');

} catch (error) {
    console.error('Apply Now button not found or not clickable:', error);
}


    await page.goBack({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.individual_internship', { timeout: 5000 }).catch(() => {});
}
console.log(submission_detail);


})();
