const cron = require('node-cron')
const coursecard = require('./model/coursecard');

cron.schedule("*/2 * * * *",async()=>{
    try{

        const courses = await coursecard.find();
        const TodayDate = new Date();
        for(const course of courses){
            const createdTime= new Date(course.createdAt);
            const diiferentTime = Math.floor((TodayDate - createdTime)/(1000*60*60))    

            if(diiferentTime >= 48 && course.currentPrice !== course.price){
                course.currentPrice = Math.floor(course.currentPrice/2);
                await course.save();
                // console.log(`Discount applied to: ${course.title}`);
            }
        }
    }
    catch(err){
        console.error("Error running discount cron:", err.message);
    }
})