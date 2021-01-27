class Tags:

    def __init__(self, tag, iso, color='white'):
        self._tag = tag
        self._color = color
        self._iso = iso

    @property
    def tag(self):
        return self._tag

    @tag.setter
    def tag(self, value):
        self._tag = value

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, value):
        self._color = value

    @property
    def color(self):
        return self._color

    @color.setter
    def color(self, value):
        self._color = value

    @property
    def iso(self):
        return self._iso

    @iso.setter
    def iso(self, value):
        self._iso = value

    def to_json(self):
        return {
            'tag': self._tag,
            'color': self._color,
            'iso': self._iso
        }

    @staticmethod
    def json_to_obj(json_file):
        return Tags(json_file['tag'],
                    json_file['iso'],
                    json_file['color']
                    )

class SimpleTag(Tags):

    def __init__(self, tag, iso, color='white'):
        super().__init__(tag, iso, color)


class ISO19650(Tags):

    def __init__(self, key, tag, iso, color):
        super().__init__(tag, iso, color)
        self._key = key

    @property
    def key(self):
        return self._key

    @key.setter
    def key(self, value):
        self._key = value

    def to_json(self):
        return {
            'tag': self._tag,
            'color': self._color,
            'iso': self._iso,
            'key': self._key
        }

    @staticmethod
    def json_to_obj(json_file):
        return ISO19650(json_file['key'],
                        json_file['tag'],
                        json_file['iso'],
                        json_file['color']
                        )