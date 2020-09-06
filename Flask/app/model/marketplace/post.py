from app.model.marketplace.product import Product
from app.model.marketplace.bid import Bid
from enum import Enum


class Status(Enum):
    OPEN = 0
    FINISHED = 1
    CLOSED = 2

class Post:

    def __init__(self, post_id, title, user_owner, product, description, date_created, date_expired, documents, bids,
                 current_best_bid, comments, visibility, location, status):
        self._post_id = post_id
        self._title = title
        self._user_owner = user_owner
        self._product = product
        self._description = description
        self._date_created = date_created
        self._date_expired = date_expired
        self._documents = documents
        self._bids = bids
        self._current_best_bid = current_best_bid
        self._comments = comments
        self._visibility = visibility
        self._location = location
        self._status = status

    @property
    def post_id(self):
        return self._post_id

    @post_id.setter
    def post_id(self, value):
        self._post_id = value

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, value):
        self._title = value

    @property
    def user_owner(self):
        return self._user_owner

    @user_owner.setter
    def user_owner(self, value):
        self._user_owner = value

    @property
    def product(self):
        return self._product

    @product.setter
    def product(self, value):
        self._product = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def date_created(self):
        return self._date_created

    @date_created.setter
    def date_created(self, value):
        self._date_created = value

    @property
    def date_expired(self):
        return self._date_expired

    @date_expired.setter
    def date_expired(self, value):
        self._date_expired = value

    @property
    def documents(self):
        return self._documents

    @documents.setter
    def documents(self, value):
        self._documents = value

    @property
    def bids(self):
        return self._bids

    @bids.setter
    def bids(self, value):
        self._bids = value

    @property
    def current_best_bid(self):
        return self._current_best_bid

    @current_best_bid.setter
    def current_best_bid(self, value):
        self._current_best_bid = value

    @property
    def comments(self):
        return self._comments

    @comments.setter
    def comments(self, value):
        self._comments = value

    @property
    def visibility(self):
        return self._visibility

    @visibility.setter
    def visibility(self, value):
        self._visibility = value

    @property
    def location(self):
        return self._location

    @location.setter
    def location(self, value):
        self._location = value

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        self._status = value

    def to_json(self, post):
        return {
                    'post_id': self._post_id,
                    'title':self._title,
                    'user_owner': self._user_owner,
                    'product': self._product.to_json(),
                    'description': self._description,
                    'date_created': self._date_created,
                    'date_expired': self._date_expired,
                    'documents': self._documents,
                    'bids': self._bids.to_json(),
                    'current_best_bid': self._current_best_bid,
                    'comments': self._comments,
                    'visibility': self._visibility,
                    'location': self._location,
                    'status': self._status
                }

    @staticmethod
    def json_to_obj(json_file):
        return Post(json_file['post_id'],
                    json_file['title'],
                    json_file['user_owner'],
                    Product.json_to_obj(json_file['product']),
                    json_file['description'],
                    json_file['date_created'],
                    json_file['date_expired'],
                    json_file['documents'],
                    [Bid.json_to_obj(x) for x in json_file['bids']],
                    json_file['current_best_bid'],
                    json_file['comments'],
                    json_file['visibility'],
                    json_file['location'],
                    json_file['status']
                    )
