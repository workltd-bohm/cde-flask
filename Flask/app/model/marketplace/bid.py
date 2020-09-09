class Bid:

    def __init__(self, bid_id, user, post_id, offer, date_created, description):
        self._bid_id = bid_id
        self._user = user
        self._post_id = post_id
        self._offer = offer
        self._date_created = date_created
        self._description = description

    @property
    def bid_id(self):
        return self._bid_id

    @bid_id.setter
    def bid_id(self, value):
        self._bid_id = value

    @property
    def user(self):
        return self._user

    @user.setter
    def user(self, value):
        self._user = value

    @property
    def post_id(self):
        return self._post_id

    @post_id.setter
    def post_id(self, value):
        self._post_id = value

    @property
    def offer(self):
        return self._offer

    @offer.setter
    def offer(self, value):
        self._offer = value

    @property
    def date_created(self):
        return self._date_created

    @date_created.setter
    def date_created(self, value):
        self._date_created = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    def to_json(self):
        return {
                'bid_id': self._bid_id,
                'user': self._user,
                'post_id': self._post_id,
                'offer': self._offer,
                'date_created': self._date_created,
                'description': self._description
            }

    @staticmethod
    def json_to_obj(json_file):
        return Bid(json_file['bid_id'],
                   json_file['user'],
                   json_file['post_id'],
                   json_file['offer'],
                   json_file['date_created'],
                   json_file['description']
                   )