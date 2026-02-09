const moongose = require("mongoose");
const Schema = moongose.Schema;

const courseInstructionSchema = new Schema({
    role:{
        type:String,
        required: true,
    },
    Budget:{
        type:String,
        required:true
    },
    ProjectRisk:{
        type:String,
        required: true,
    },
    CaseStudy:{
        type:String,
        required:true
    },
    Requirement:{
        type:String,
        required: true
    },
    AboutCourse:{
        type:String,
        required: true
    }
},{
    timestamps:true,
})

module.exports = moongose.model("CourseInstruction",courseInstructionSchema)
