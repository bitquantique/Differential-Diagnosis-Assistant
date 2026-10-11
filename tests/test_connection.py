import ollama

def ask_model(prompt:str)->str:
    response = ollama.chat(
        model = "llama3.1:8b",
        messages = [
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )
    reply_text = response["message"]["content"]
    return reply_text

print(ask_model("Respond with 'Connected'"))