# Worldtune Calling API Implementation Plan

## Primary Focus: Outbound Calling to Phone Numbers

Based on current priorities, the implementation will focus exclusively on **outbound calling to phone numbers** - allowing users to place calls from the web application to any landline or mobile phone globally.

## Implementation Approach: Twilio Voice API

For outbound calling to phone numbers, Twilio Voice API is the recommended solution:

- Simple, reliable API with global reach
- Minimal setup required to start making calls
- Extensive documentation and support
- Predictable per-minute pricing model

## Outbound Calling Cost Structure

### Basic Infrastructure
- US/Canada phone numbers: $1.00/month each
- International numbers (if needed): Varies by country ($1-10/month)

### Outbound Call Rates (US/Canada)
- Calls to landlines: $0.013/minute
- Calls to mobile phones: $0.013/minute

### International Outbound Rates
- Vary significantly by country ($0.02 to $1.00+ per minute)
- Higher rates for mobile numbers in some countries

## Monthly Cost Estimates (Outbound Only)

| Usage Level | Users | Monthly Outbound Minutes | Est. Cost |
|-------------|-------|-------------------------|-----------|
| Low         | 100   | 100                     | ~$2.30    |
| Medium      | 1,000 | 3,000                   | ~$40      |
| High        | 5,000 | 15,000                  | ~$200     |

## Implementation Steps

### 1. Twilio Account Setup
- Create Twilio account
- Purchase at least one phone number to use as caller ID
- Set up billing information
- Generate API credentials (Account SID and Auth Token)

### 2. Backend Implementation
- Create a secure API endpoint to generate Twilio access tokens
- Implement call initiation endpoint that uses Twilio's REST API
- Set up TwiML for call control and routing
- Implement call status webhook handlers

### 3. Frontend Implementation
- Build phone number input with international format support
- Create call controls (connect, disconnect, mute)
- Implement call status display and timer
- Add error handling for failed calls

### 4. Call Recording & Transcription (Optional)
- Enable call recording via Twilio API
- Implement secure storage for recordings
- Add transcription processing using Twilio or custom AI

## Code Examples

### Backend: Initiating an Outbound Call (Node.js)

```javascript
// Example using Twilio Node.js SDK
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/api/call', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    const call = await client.calls.create({
      url: 'https://your-server.com/twiml/outbound-call',
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    
    res.json({ success: true, callSid: call.sid });
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### TwiML for Outbound Call

```xml
<!-- Example TwiML for outbound call -->
<Response>
  <Say>Hello, this is a call from Worldtune.</Say>
  <Dial callerId="+1XXXXXXXXXX">
    <!-- The number will be dynamically inserted by Twilio -->
  </Dial>
</Response>
```

### Frontend: Call Button Implementation (React)

```jsx
import { useState } from 'react';

function CallButton({ phoneNumber }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  
  const initiateCall = async () => {
    setIsCallActive(true);
    setCallStatus('Connecting...');
    
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCallStatus('Call connected');
      } else {
        setCallStatus('Call failed');
        setIsCallActive(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setCallStatus('Error connecting call');
      setIsCallActive(false);
    }
  };
  
  return (
    <div>
      <button 
        onClick={initiateCall} 
        disabled={isCallActive}
        className={`call-button ${isCallActive ? 'active' : ''}`}
      >
        {isCallActive ? 'End Call' : 'Call'}
      </button>
      <div className="call-status">{callStatus}</div>
    </div>
  );
}
```

## Technical Requirements

### Backend
- Node.js server with Express (recommended)
- Twilio SDK installed
- Secure environment for API credentials
- Webhook endpoints for call status updates

### Frontend
- React components for call interface
- Phone number validation and formatting
- Call status management
- Error handling for network issues

### Infrastructure
- Twilio account with voice capabilities
- At least one phone number for caller ID
- Server with TLS/SSL for secure communication
- Database for call logging (optional)

## Resources
- [Twilio Voice API Documentation](https://www.twilio.com/docs/voice/api)
- [Twilio Client JavaScript SDK](https://www.twilio.com/docs/voice/client/javascript)
- [Twilio TwiML Documentation](https://www.twilio.com/docs/voice/twiml)
- [International Phone Number Formatting Library](https://github.com/catamphetamine/libphonenumber-js) 