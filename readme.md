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