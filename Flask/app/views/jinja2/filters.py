from app import *
from datetime import datetime


def aceess_time_check(date):
        date_time_obj = datetime.strptime("2070-04-10T12:10", "%Y-%m-%dT%H:%M")
        if date != 'indefinitely':
            date_time_obj = datetime.strptime(date, "%Y-%m-%dT%H:%M")
        if date_time_obj > datetime.now():
            return True
        return False


app.jinja_env.filters['access'] = aceess_time_check
