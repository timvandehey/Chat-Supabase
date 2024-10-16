// Supabase credentials (replace with your actual values)
const SUPABASE_URL = 'https://iukglkbkxyprerwqxlcr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a2dsa2JreHlwcmVyd3F4bGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5NDM3MjQsImV4cCI6MjA0NDUxOTcyNH0.dykuW0FdpFsVrt7qN7WmD8_SGMv2fS_9vJwY_-wyLpk';
console.log(window.supabase)
// Initialize Supabase
const supabase = globalThis.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const form = document.getElementById('input-box')
let user

// Load existing messages from the database
async function loadMessages() {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching messages:', error);
  } else {
    console.log({messages})
    chatBox.replaceChildren()
    messages.reverse().forEach((message) => displayMessage(message));
  }
}

// Display a message in the chat box
function displayMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.innerHTML = `<span>${message.user}:</span> ${message.content}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
}

// Send a new message to the database
async function sendMessage(e) {
    e.preventDefault()
  const content = messageInput.value.trim();
  user = user ?? prompt('Enter your username:');

  if (content && user) {
    const { error } = await supabase.from('messages').insert([{ content, user }]);
    if (error) {
      console.error('Error sending message:', error);
    }
    messageInput.value = ''; // Clear input
  }
}

// Listen for new messages via Supabase Realtime
function listenForNewMessages() {
  supabase
    .channel('realtime:public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      chatBox?.firstChild?.remove()
        displayMessage(payload.new);
    })
    .subscribe();
}

// Event listener for sending messages
form.addEventListener('submit', sendMessage);

// Load existing messages and start listening for new ones
loadMessages();
listenForNewMessages();
