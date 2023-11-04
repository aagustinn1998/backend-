const socket = io();
let user = "";

const saveForm = async () => {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const thumbnail = document.getElementById("thumbnailUrl").value;
  const code = document.getElementById("code").value;
  const stock = document.getElementById("stock").value;

  const data = { title, description, price, thumbnail, code, stock };

  const rawStr = JSON.stringify(data);

  await fetch("http://localhost:8080/api/v1/product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: rawStr,
  });
};

const showChatLoginForm = async () => {
  const result = await Swal.fire({
    title: "Nice!",
    imageUrl:
      "https://imgs.search.brave.com/FGUVybdh_cqokuGTRSrAEJS8vVpLFYEIQ1z-20waAu4/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAxLzM1LzIzLzk1/LzM2MF9GXzEzNTIz/OTU4NV9hMmdza2g4/THJjQkVYYk9sbm9X/aWZPVkR6Q3RScGJC/Ri5qcGc",
    imageWidth: 300,
    imageHeight: 200,
    imageAlt: "",
    text: "Please enter your username",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    preConfirm: (username) => {
      console.log("🚀 ~ file: index.js:50 ~ showChatLoginForm ~ username:", username);
      if (!username) {
        Swal.showValidationMessage(`You need to provide a username`);
      }
    },
    showCancelButton: false,
    confirmButtonText: "Confirm",
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

  const { value, isConfirmed } = result;

  if (isConfirmed) {
    user = value;
    socket.emit("authenticated", value);
  }
};

//
socket.on("messageLogs", (data) => {
  let log = document.getElementById("messages-log");
  let messages = "";
  data.forEach((message) => {
    messages += `${message.user} says: ${message.content}</br>`;
  });
  log.innerHTML = messages;
});

socket.on("newUserConnected", (data) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    title: `${data} is connected`,
    icon: "success",
  });
});

const messageText = document.getElementById("message-text");
messageText.addEventListener("keypress", (evt) => {
  if (evt.key === "Enter") {
    if (messageText.value.trim().length > 0) {
      socket.emit("message", { user, content: messageText.value });
      messageText.value = "";
    }
  }
});

if (!user) {
  showChatLoginForm();
}
