class Tags:

    def __init__(self, tag, color='white'):
        self._tag = tag
        self._color = color

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

    def to_json(self):
        return {
            'tag': self._tag,
            'color': self._color
        }

    @staticmethod
    def json_to_obj(json_file):
        return Tags(json_file['tag'],
                    json_file['color']
                    )
