from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os

TOKEN_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "token.json")


def get_calendar_service():
    creds = Credentials.from_authorized_user_file(TOKEN_PATH, ["https://www.googleapis.com/auth/calendar"])

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())

    service = build("calendar", "v3", credentials=creds)
    return service


def create_calendar_event(summary: str, description: str, start_time, end_time, attendee_emails: list):
    try:
        service = get_calendar_service()

        event = {
            "summary": summary,
            "description": description,
            "start": {
                "dateTime": start_time.isoformat(),
                "timeZone": "Asia/Kolkata",
            },
            "end": {
                "dateTime": end_time.isoformat(),
                "timeZone": "Asia/Kolkata",
            },
            "attendees": [{"email": email} for email in attendee_emails],
        }

        created_event = service.events().insert(
            calendarId="primary", body=event, sendUpdates="all"
        ).execute()

        return created_event.get("id")
    except Exception as e:
        print(f"Calendar event creation failed: {e}")
        return None


def delete_calendar_event(event_id: str):
    try:
        service = get_calendar_service()
        service.events().delete(calendarId="primary", eventId=event_id, sendUpdates="all").execute()
        return True
    except Exception as e:
        print(f"Calendar event deletion failed: {e}")
        return False