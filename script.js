const container = document.querySelector(".container")
const chatsContainer = document.querySelector(".chats-container")
const promptForm = document.querySelector(".prompt-form")
const promptInput = promptForm.querySelector(".prompt-input")
const fileInput = promptForm.querySelector("#file-input")
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper")



const API_KEY = 'AIzaSyCGp1Jde1Jl9Moi5wVOg2W_Pi328_TxXyg';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`


const chatHistory = [];
const userData = { message: '', file: {} }


// Function to create message element
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div")
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div
}

const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })

const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = " "
    const words = text.split(" ")
    let wordIndex = 0

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++]
            scrollToBottom()
        } else {
            clearInterval(typingInterval)
            botMsgDiv.classList.remove('loading')
        }
    }, 40)
}



const generateResponse = async (botMsgDiv) => {

    const textElement = botMsgDiv.querySelector('.message-text')

    // Add usermessage to chat history 
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ... (userData.file.data ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file) }] : [])]
    })

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        })

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
        typingEffect(responseText, textElement, botMsgDiv)

        chatHistory.push({ role: 'model', parts: [{ text: responseText }] })

        console.log(chatHistory)

    } catch (error) {
        console.log(error)
    } finally {
        userData.file = {}

    }

}

// handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value = ''
    userData.message = userMessage
    fileUploadWrapper.classList.remove('active', 'img-attached', 'file-attached')


    // generate user message html and adds in chat container
    const userMsgHTML = `<p class="message-text"></p> 
    ${userData.file.data ? (userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />` : `<p class="file-attachment"><span  class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`) : ""}
    `
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom()

    setTimeout(() => {
        // generate user message html and adds in chat container
        const botMsgHTML = `<img src="gemini-chatbot-logo (1).svg" class="avatar"><p class="message-text">Just a sec...</p>`
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", 'loading');
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom()
        generateResponse(botMsgDiv);
    }, 500);
}

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;


    const isImage = file.type.startsWith('image/')
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (e) => {
        fileInput.value = ''
        const base64String = e.target.result.split(',')[1]
        fileUploadWrapper.querySelector('.file-preview').src = e.target.result
        fileUploadWrapper.classList.add('active', isImage ? 'img-attached' : 'file-attached')

        userData.file = { fileName: file.name, data: base64String, mime_type: file.type, isImage }
    }
})

document.querySelector('#cancel-file-btn').addEventListener('click', () => {
    userData.file = {}
    fileUploadWrapper.classList.remove('active', 'img-attached', 'file-attached')
})


promptForm.addEventListener("submit", handleFormSubmit)
promptForm.querySelector('#add-file-btn').addEventListener('click', () => fileInput.click())
