
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { User_Model, Submitted_forms_Model, Internshala_user_Model } from './data_base.js';
import dotenv from 'dotenv';
dotenv.config();

const email = process.env.INTERNSHALA_EMAIL;
const password = process.env.INTERNSHALA_PASSWORD; 

const JWT_SECRET='ajldkldlkdshdhfh2342fddssxcbnb';
await mongoose.connect("mongodb+srv://arinbalyan:ldZsIikKx3mlwSRf@cluster0.cksskgm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Internshala_filler_database");
 puppeteer.use(StealthPlugin());
 let submission_detail=[];

const uploadResume = async (page, resumePath) => {
    try {
        if (!fs.existsSync(resumePath)) {
            throw new Error(`Resume file not found: ${resumePath}`);
        }

        console.log(`Attempting to upload resume: ${resumePath}`);

        const possibleSelectors = [
            'input[type="file"]',
            '#custom_resume',
            '#resume-upload',
            '.file-upload input',
            '[name="resume"]',
            '[name="cv"]',
            'input[accept*="pdf"]'
        ];

        let fileInput = null;
        
        for (const selector of possibleSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                fileInput = await page.$(selector);
                if (fileInput) {
                    console.log(`Found file input with selector: ${selector}`);
                    break;
                }
            } catch (e) {}
        }

        if (fileInput) {
            const absolutePath = path.resolve(resumePath);
            await fileInput.uploadFile(absolutePath);
            console.log('Resume uploaded successfully');
            
            await new Promise(res => setTimeout(res, 3000));
            
        } else {
            console.warn('No file input found - resume upload may not be required for this internship');
            return false;
        }

        return true;

    } catch (error) {
        console.error('Resume upload failed:', error.message);
        await page.screenshot({ path: `resume-upload-error-${Date.now()}.png` });
        return false;
    }
};
const submit= async(page)=>{
    const possibleSubmitSelectors = [
            'input[type="submit"][id="submit"]',  
            'button[type="submit"]',
            '#submit',
            '.btn-primary',
            '.btn-large',
            'input[value="Submit"]'
        ];
        
        let submitted = false;
        
        for (const selector of possibleSubmitSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 3000 });
                const submitButton = await page.$(selector);
                
                if (submitButton) {
                    await submitButton.evaluate(btn => btn.scrollIntoView());
                    await new Promise(res => setTimeout(res, 1000));
                    await submitButton.click();
                    console.log(`Submitted application using selector: ${selector}`);
                    submitted = true;
                    break;
                }
            } catch (e) {
            }
        }
}
const clickApplyNowButton = async (page) => {
    try {
        console.log('Attempting to click "Apply now" button...');
        
        
        await page.waitForSelector('#easy_apply_button', { visible: true, timeout: 10000 });
        
        await page.evaluate(() => {
            const button = document.getElementById('easy_apply_button');
            if (button) button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        
        await page.click('#easy_apply_button');
        console.log('Successfully clicked "Apply now" button');
        
        await new Promise(res => setTimeout(res, 3000));
        
        return true;
    } catch (error) {
        console.error('Error clicking "Apply now" button:', error.message);
        await page.screenshot({ path: `apply-now-error-${Date.now()}.png` });
        return false;
    }
};

const fillAdditionalQuestions = async (page) => {
    try {
        console.log('Checking for additional questions...');
        

        await new Promise(res => setTimeout(res, 2000));
        
        
        const textAreas = await page.$$('textarea');
        for (let i = 0; i < textAreas.length; i++) {
            try {
                const placeholder = await page.evaluate(el => el.placeholder || '', textAreas[i]);
                const label = await page.evaluate(el => {
                    const labelEl = el.closest('.form-group')?.querySelector('label');
                    return labelEl ? labelEl.textContent.trim() : '';
                }, textAreas[i]);
                
                console.log(`Found textarea with label: "${label}" and placeholder: "${placeholder}"`);
                
                if (placeholder.toLowerCase().includes('cover') || label.toLowerCase().includes('cover')) {
                    await textAreas[i].type('I am excited about this internship opportunity as it aligns perfectly with my technical skills and career goals. With my experience in full-stack development using MERN stack and strong problem-solving abilities, I am confident I can contribute effectively to your team.');
                    console.log('Filled cover letter');
                } else if (placeholder.toLowerCase().includes('why') || label.toLowerCase().includes('why')) {
                    await textAreas[i].type('I am interested in this position because it offers the perfect opportunity to apply my technical skills in a real-world environment while learning from experienced professionals in the industry.');
                    console.log('Filled why interested question');
                } else if (placeholder.toLowerCase().includes('experience') || label.toLowerCase().includes('experience')) {
                    await textAreas[i].type('I have experience in full-stack web development with MERN stack, competitive programming, and have completed various projects including web applications and algorithmic solutions.');
                    console.log('Filled experience question');
                } else {
                
                    await textAreas[i].type('I am a dedicated Computer Science student with strong technical skills and passion for software development. I am eager to contribute and learn in a professional environment.');
                    console.log(' Filled generic question');
                }
                
                await new Promise(res => setTimeout(res, 1000));
            } catch (textError) {
                console.log(` Could not fill textarea ${i}:`, textError.message);
            }
        }
        
        
        const radioButtons = await page.$$('input[type="radio"]');
        for (let radio of radioButtons) {
            try {
                const value = await page.evaluate(el => el.value, radio);
                const name = await page.evaluate(el => el.name, radio);
                
                if (value && (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true')) {
                    await radio.click();
                    console.log(` Selected radio button: ${name} = ${value}`);
                    await new Promise(res => setTimeout(res, 500));
                }
            } catch (radioError) {
                console.log(' Could not handle radio button:', radioError.message);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error filling additional questions:', error.message);
        return false;
    }
};


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

    await page.type('#modal_email', email , { delay: 125 });
    await new Promise(res => setTimeout(res, 1600));
    await page.type('#modal_password', password, { delay: 180 });
        await new Promise(res => setTimeout(res, 3000));

    await page.click('#modal_login_submit');
        await new Promise(res => setTimeout(res, 500));

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
var arr = [17, 18, 19, 20, 21, 22, 23];

async function selectCategoryWithRetry(page, indexArray) {
    for(let i = 0; i < indexArray.length; i++){
        const currentIndex = indexArray[i];
        let success = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!success && attempts < maxAttempts) {
            attempts++;
            console.log(`Selecting index ${currentIndex} - Attempt ${attempts}/${maxAttempts}`);
            
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await page.waitForSelector('#select_category_chosen', { visible: true, timeout: 10000 });
                await page.click('#select_category_chosen');
                
                await page.waitForSelector('.chosen-drop', { visible: true, timeout: 10000 });
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const selector = `li.active-result[data-option-array-index="${currentIndex}"]`;
                
                const elementExists = await page.evaluate((sel) => {
                    return document.querySelector(sel) !== null;
                }, selector);
                
                if (!elementExists) {
                    console.log(`Element with selector ${selector} not found`);
                    throw new Error(`Element not found: ${selector}`);
                }
                
                await page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.scrollIntoView({ block: 'center' });
                        element.click();
                        return true;
                    }
                    return false;
                }, selector);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await page.evaluate(() => {
                    const dropdown = document.querySelector('.chosen-drop');
                    if (dropdown) {
                        dropdown.style.display = 'none';
                    }
                });
                
                success = true;
                console.log(`Successfully selected index ${currentIndex}`);
                
            } catch (error) {
                console.error(`Attempt ${attempts} failed for index ${currentIndex}:`, error.message);
                
                try {
                    await page.evaluate(() => {
                        const dropdown = document.querySelector('.chosen-drop');
                        if (dropdown) {
                            dropdown.style.display = 'none';
                        }
                        document.body.click();
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {
                    console.error('Recovery failed:', e.message);
                }
                
                if (attempts === maxAttempts) {
                    console.error(`Failed to select index ${currentIndex} after ${maxAttempts} attempts`);
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
}

await selectCategoryWithRetry(page, arr);

            } catch (error) {
                console.error(`Attempt ${attempts} failed for index ${currentIndex}:`, error.message);
                if (attempts === maxAttempts) {
                    console.error(`Failed to select index ${currentIndex} after ${maxAttempts} attempts`);
                }
                await delay(2000);
            }
        }
    }
}
await selectCategoryWithRetry(page, [17, 18, 19, 20, 21, 22, 23]);

}
     catch (error) {
        console.error('Error occurred:', error);
        await page.screenshot({ path: 'error-screenshot.png' });
    }

    await new Promise(res => setTimeout(res, 5000));

const internshipData = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.individual_internship'));
    return elements
        .filter(el => {
            const isHidden = window.getComputedStyle(el).display === 'none';
            const hasId = el.id?.startsWith('individual_internship_');
            return !isHidden && hasId;
        })
        .map(el => {
            
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
    const applyClicked = await clickApplyNowButton(page);

    console.log('Clicked Apply Now button.');
        await new Promise(res => setTimeout(res, 5000));

  try {
  await page.waitForSelector('button.btn.btn-large.education_incomplete.proceed-btn', {
    visible: true,
    timeout: 10000
  });

  const button = await page.$('button.btn.btn-large.education_incomplete.proceed-btn');

  if (button) {
    const box = await button.boundingBox();
    if (box) {
 await new Promise(res => setTimeout(res, 500));      
 await button.click();
 console.log(" Clicked 'Proceed to application' button successfully.");
    } else {
      console.warn("Button found but not visible/clickable.");
    }
  } else {
    console.warn(" Button not found.");
  }
} catch (error) {
  console.error(" Error clicking 'Proceed to application':", error.message);
 // await page.screenshot({ path: `proceed-btn-error-${Date.now()}.png` });
}


 await new Promise((res)=>{setTimeout(res,5000)});
 await page.waitForSelector('#radio1', { visible: true, timeout: 5000 });
                    await page.click('#radio1');
                    console.log(' Selected availability radio button');

 await uploadResume(page, './update_cv.pdf');
  await fillAdditionalQuestions(page);
  await submit(page);

    submission_detail.push({title:internshipData[i].title,company:internshipData[i].company});
 await new Promise((res)=>{setTimeout(res,5000)});

} catch (error) {
    console.error('Apply Now button not found or not clickable:', error);
}


    await page.goBack({ waitUntil: 'networkidle2' });
    await page.waitForSelector('.individual_internship', { timeout: 5000 }).catch(() => {});
}
console.log(submission_detail);
new Promise(res=>{
    setTimeout(res,2000);
})
browser.close();

})();