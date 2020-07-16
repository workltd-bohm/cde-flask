from flask import Flask, json, request, Response, render_template, session, redirect, url_for
from app import *


@app.route('/')
def index():
    print('Data posting path: %s' % request.path)
    if session.get('user'):
        username = session['user']['username']
        id = session['user']['id']
        email = session['user']['email']
        menu = render_template("menu/menu.html")
        dashboard = render_template("dashboard/dashboard.html")
        return render_template("index.html",
                               username=username,
                               id=id,
                               email=email,
                               menu=menu,
                               dashboard=dashboard)
    else:
        return redirect('/login')