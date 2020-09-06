class Bid:

    def __init__(self, bid_id, user, post_id, offer, description):
        self._bid_id = bid_id
        self._user = user
        self._post_id = post_id
        self._offer = offer
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
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    def to_json(self, post):
        return {
                'bid_id': self._bid_id,
                'user':self._user,
                'post_id': self._post_id,
                'offer': self._offer,
                'description': self._description
            }

    @staticmethod
    def json_to_obj(json_file):
        return Bid(json_file['bid_id'],
                   json_file['user'],
                   json_file['post_id'],
                   json_file['offer'],
                   json_file['description']
                   )