const chatsContainer = document.querySelector(".chats-container")
const promptForm = document.querySelector(".prompt-form")
const promptInput = promptForm.querySelector(".prompt-input")

const API_KEY = 'AIzaSyCGp1Jde1Jl9Moi5wVOg2W_Pi328_TxXyg';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

let userMessage = ""
const chatHistory =[];


// Function to create message element
const createMsgElement = (content,...classes) => {
    const div = document.createElement("div")
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div
}


const generateResponse = async (botMsgDiv)=>{

    const textElement = botMsgDiv.querySelector('.message-text')

    // Add usermessage to chat history 
    chatHistory.push({
        role: "user",
        parts: [{text:userMessage}]
    })

    try{
        const response = await fetch(API_URL,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory})
        })

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g,'$1').trim();
        textElement.textContent = responseText
    }catch(error){
        console.log(error)
    }
    
}

// handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;
    
    promptInput.value=''

    // generate user message html and adds in chat container
    const userMsgHTML=`<p class="message-text"></p>`
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage
    chatsContainer.appendChild(userMsgDiv);

    setTimeout(() => {
        // generate user message html and adds in chat container
        const botMsgHTML=`<img src="gemini-chatbot-logo (1).svg" class="avatar"><p class="message-text">Just as sec...</p>`
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message",'loading');
        chatsContainer.appendChild(botMsgDiv);
        generateResponse(botMsgDiv);
    }, 600);
}

promptForm.addEventListener("submit", handleFormSubmit)
