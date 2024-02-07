import smtplib
from email.mime.text import MIMEText

# recipients = ["email1", "email2", "email3"]

def send_email(subject, body, recipients):
    sender = "allen@workltd.co.uk"
    password = ""
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = ', '.join(recipients)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp_server:
       smtp_server.login(sender, password)
       smtp_server.sendmail('allen@workltd.co.uk', recipients, msg.as_string())
