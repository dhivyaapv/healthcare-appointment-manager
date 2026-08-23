from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/calendar"]

flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES)
creds = flow.run_local_server(port=8081)

with open("token.json", "w") as token_file:
    token_file.write(creds.to_json())

print("Authorization complete. token.json created.")
