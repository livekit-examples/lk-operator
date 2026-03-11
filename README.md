# LiveKit Operator

This is an example of an agentic browser application inspired by OpenAI's [Operator](https://openai.com/index/introducing-operator/). It demonstrates a LiveKit agent that can:

- spawn a headless browser instance with a playwright interface
- pixel-stream the browser UI to the client
- use Claude's [Computer use tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) to "see" and manipulate the browser instance using natural language prompts
- allow the user to remotely control the browser and collaborate with the agent on a task

## To run this demo

### Agent
1. `cd agent`
2. `python -m venv .venv`
3. `source .venv/bin/activate`
4. `pip install -r requirements.txt`
5. `cp .env.example .env`
6. add values for keys in `.env`
7. `python agent.py dev` 

### Client
1. `cd frontend`
2. `npm i`
3. `cp ../agent/.env ./.env.local`
4. `npm run dev`
5. open your browser to `http://localhost:3000` (or whichever port your webserver is running on)



