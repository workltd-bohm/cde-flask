import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

smtp_port = 587
smtp_server = "smtp.ionos.co.uk"
sender_email = "notify@bohm.work"
receiver_email = [
    ["toma.dimcic@gmail.com", "Toma"],
    ["milos.dimcic@gmail.com", "Milos"],
    # ["kraksorz@gmail.com", "Filip"],
    ["phillip.zoghby@gmail.com", "Phillip"]
]
password = "CrVbF2ej9-_z#HE"

message = MIMEMultipart("alternative")
message["Subject"] = "Account confirmation"
message["From"] = sender_email

html1 = "<html><body>"
html2 = "</body></html>"


def send_an_email(username, email):
    # Create secure connection with server and send email
    context = ssl.create_default_context()
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.ehlo()  # Can be omitted
        server.starttls(context=context)
        server.ehlo()  # Can be omitted
        server.login(sender_email, password)
        for receiver in receiver_email:
            message["To"] = receiver[0]
            body = "<p>Hi %s,<br><br>If you want to confirm the account for: <br>" \
                   "username: %s <br>" \
                   "email: %s <br><br>" \
                   "please click the following link: <br>" \
                   "<br><a href=\"http://localhost/confirm_account?username=%s&email=%s\">Confirm</a> " \
                   "</p>" % (receiver[1], username, email, username, email)
            m = MIMEText(html1 + body + html2, "html")
            message.attach(m)
            server.sendmail(
                sender_email, receiver[0], message.as_string()
            )
            print('message sent to: %s' %receiver[1])

# send_an_email("username", "email")