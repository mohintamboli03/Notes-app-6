require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.CONNECTION);

const User = require("./models/user.model");
const Note = require("./models/notes.model");
const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const bcrypt= require("bcryptjs");

const { authenticateToken } = require("./utilities");

app.use(express.json());

app.use(
    cors({
        origin: "https://notes-app-6-frontend.onrender.com", // Allow only your live frontend
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true // If you need to support cookies or sessions
    })
);


app.options('*', cors());



// create account
app.post( "/create-account" ,async (req, res) => {

    const { fullName, email, password } = req.body;
    if (!fullName) {
        res.status(400).json(
            {
                error: true,
                message: "fullName is required"

            }
        );
    }


    if (!email) {
        res.status(400).json(
            {
                error: true,
                message: "email is required"

            }
        );
    }


    if (!password) {
        res.status(400).json(
            {
                error: true,
                message: "password is required"

            }
        );
    }

    const isUser = await User.findOne({ email: email });

    if (isUser) {
        return res.json({
            error: true,
            message: "User already exists",
        });
    }

    // HASH PASSWORD HERE
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);



    const user = new User({
        fullName,
        email,
        password:hashedPassword
    });

    await user.save();

    const accessToken = jwt.sign(
        { user }, process.env.ACESS_TOKEN_SECRET, {
        expiresIn: "36000m",
    }
    );

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Rgistration successfull"
    });

});



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({
            message: "email is required"
        });

    }

    if (!password) {
        return res.status(400).json({
            message: "password is required"
        });

    }

    const userInfo = await User.findOne({ email });

    if (!userInfo) {
        return res.status(400).json({
            message: "user not found"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userInfo?.password || "");

    if (userInfo.email == email && isPasswordCorrect) {
        const user = { user: userInfo };
        const accessToken = jwt.sign(user, process.env.ACESS_TOKEN_SECRET, {
            expiresIn: "36000m",
        });


        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "invalid credentials"
        });
    }


});


// get user

app.get("/get-user", authenticateToken, async (req, res) => {

    const { user } = req.user;
    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
        return res.sendStatus(401);
    }

    return res.json({
        user: {
            fullName: isUser.fullName,
            email: isUser.email,
            "_id": isUser._id,
            createdOn: isUser.createdOn
        },
        message: "",
    });

});



// add note

app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    const { user } = req.user;

    if (!title) {
        return res.status(400).json({
            error: true,
            message: "title is required"
        });
    }

    if (!content) {
        return res.status(400).json({
            error: true,
            message: "content is required"
        });

    }

    try {
        const note = new Note({
            title,
            content,
            tags: tags || [],
            userId: user._id

        });

        await note.save();

        return res.json({
            error: false,
            note,
            message: "note saved Successfully"
        });
    } catch (error) {
        return res.status(500), express.json({
            error: true,
            message: "internal server error"
        });

    }
});


// edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title && !content && !tags) {
        return res.status(400).json({
            error: true,
            message: "no changes provided"
        });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Note not found"
            });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully"
        });

    } catch (error) {
        return res.status(500), express.json({
            error: true,
            message: "internal server error"
        });
    }
});

// get all notes

app.get("/get-all-notes/", authenticateToken, async (req, res) => {
    const { user } = req.user;


    try {
        const notes = await Note.find({
            userId: user._id
        }).sort({ isPinned: -1 });

        return res.json({
            error: false,
            notes,
            message: "Notes retrived Successfully"
        });
    } catch (error) {
        return res.status(500), express.json({
            error: true,
            message: "internal server error"
        });
    }
});


// delete note

app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user; // Correctly access the user object

    try {
        // Find the note by ID and the user's ID to ensure the note belongs to the user
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Note not found",
            });
        }

        // Delete the note
        await Note.deleteOne({ _id: noteId, userId: user._id });

        return res.json({
            error: false,
            message: "Note deleted successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});



// ispinned update

app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;


    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Note not found"
            });
        }


        note.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Note updated successfully"
        });

    } catch (error) {
        return res.status(500), express.json({
            error: true,
            message: "internal server error"
        });
    }
});

// search notes

app.get("/search-notes/",authenticateToken,async(req,res)=>{
  const {user}= req.user;
  const {query}=req.query;
   
  if(!query){
    return res.status(400).json({
        error:true,
        message:"search query is required"
    });
  }

  try {
    const matchingNote= await Note.find({
        userId:user._id,
        $or:[
            {title:{$regex: new RegExp(query,"i")}},
            {content:{$regex: new RegExp(query,"i")}},
        ],
    });

     return res.json({
        error:false,
        notes:matchingNote,
        message:"Notes matching the search query retrived successfully"

     });

  } catch (error) {
    return res.status(500).json({
        error:true,
        message:'internal server error'
    });
  }

});


app.listen(process.env.PORT || 3000);


module.exports = app;
