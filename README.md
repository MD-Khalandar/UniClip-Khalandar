# UniClip

UniClip is a real-time shared clipboard and messaging application that allows multiple devices to connect to the same room and instantly share text, clipboard content, and message history.

The project is built around real-time communication using Socket.IO, with support for room-based synchronization, clipboard automation, history management, and reconnect-friendly behavior.

---

## Features

### Room-Based Sharing

- Create a unique room with a randomly generated room code
- Join an existing room using the room code
- Share a room using a generated URL
- Leave the room at any time
- Room data is isolated from other rooms

---

### Real-Time Messaging

- Send messages instantly between connected devices
- Messages appear without refreshing the page
- Uses Socket.IO for real-time communication
- Messages are stored in room history
- Maintains message order for all connected users

---

### Clipboard Synchronization

- Room host can push clipboard content to the room
- Joined users can sync the latest clipboard content to their own device
- Clipboard access uses the browser Clipboard API
- Manual clipboard push and sync supported

---

### Auto Push

The room host can enable Auto Push.

When enabled:

- The browser checks the host clipboard periodically
- New clipboard content is detected automatically
- Changed clipboard content is pushed to the room
- Duplicate clipboard values are ignored
- Clipboard polling stops when Auto Push is disabled

The clipboard is currently checked approximately once every second.

---

### Auto Sync

Joined devices can enable Auto Sync.

When enabled:

- New clipboard entries received from the host are automatically copied to the device clipboard
- Users do not need to manually click the Sync button for every new clipboard entry

Manual sync is still available as a fallback.

---

### Clipboard History

- Stores recent clipboard pushes
- Stores regular messages
- Displays previous room activity
- Old clipboard entries can be synced again
- Clipboard entries and messages are differentiated using entry types
- (totally not used ai for readme)

Example history structure:

```js
{
    type: "clipboard",
    text: "https://github.com/example"
}
```
Deployed on render :  https://uniclip-khalandar-1.onrender.com
deployed on AWS :UniClipKhalandar-env.eba-bmndvfsw.ap-southeast-2.elasticbeanstalk.com 
