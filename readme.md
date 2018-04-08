# Kreamont Assistent Chatbot

### Whats this?
this is the source for a dialogflow webhook for actions on google

Check it out with your android device, using: 
* "Ok Google frag Montessori Assistent was gibts Neues?"
* "Ok Google frag Montessori Assistent was sind die nächsten Termine?"

### Configuration - Environmennt Variable
    set KREAMONT_PASSWORD=...
    
### Running - live reload
    npm run debug

### Running
    npm start

### CI
    git push heroku master

### Webhooks
* https://kreamont-chatbot-v2.herokuapp.com/api/dialogflow-webhook
* https://predator.this-is-rocket.science/chatbot/api/dialogflow-webhook

### Useful dev links
* https://developers.google.com/actions/assistant/helpers#dialogflow
* https://developers.google.com/actions/reference/nodejs/DialogflowApp
* https://github.com/dialogflow/fulfillment-webhook-json/tree/master/responses/v2/ActionsOnGoogle
* https://github.com/dialogflow/agent-human-handoff-nodejs

### Developing dialogflow local
Dialogflow Constraint: webhook must be "https"

* buy a cheap domain like this-is-rocket.science (~6$ for 5 years)
* register a "no-ip" (=free dyndns)
* DNS CNAME of your domain point to your "no-ip" name like (fastbreeder.hopto.org)
* configure home router to use "no-ip" domain
* configure some port 443 to point to your local machine (e.g.: raspberry pi)
* run a apache httpd as reverse proxy on 443 (e.g.: /chatbot -> http://localhost:5000)
* configure apache httpd for ssl termination, so your nodejs application gets http
* get a free ssl certificate. google for "free ssl" (e.g.: zerossl)

now you can "debug" requests from dialogflow