// audio setup
const keyStrokeSounds = [
  new Audio("/sounds/keystroke1.mp3"),
  new Audio("/sounds/keystroke2.mp3"),
  new Audio("/sounds/keystroke3.mp3"),
  new Audio("/sounds/keystroke4.mp3"),
];

const messageSentSound = new Audio("/sounds/notification.mp3");
const messageReceivedSound = new Audio("/sounds/notification.mp3");

function useKeyboardSound() {
  const playRandomKeyStrokeSound = () => {
    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

    randomSound.currentTime = 0; // this is for a better UX
    randomSound.play().catch((error) => console.log("Audio play failed:", error));
  };

  const playMessageSentSound = () => {
    messageSentSound.currentTime = 0;
    messageSentSound.play().catch((error) => console.log("Send sound play failed:", error));
  };

  const playMessageReceivedSound = () => {
    messageReceivedSound.currentTime = 0;
    messageReceivedSound.play().catch((error) => console.log("Receive sound play failed:", error));
  };

  return { 
    playRandomKeyStrokeSound, 
    playMessageSentSound, 
    playMessageReceivedSound 
  };
}

export default useKeyboardSound;