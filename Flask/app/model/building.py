class Building:

    def __init__(self, name, description):
        self._name = name
        self._description = description
        self._custom = ''

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def custom(self):
        return self._custom

    @custom.setter
    def custom(self, value):
        self._custom = value

    def to_json(self):
        return {
            'name': self._name,
            'description': self._description,
            'custom': self._custom
        }

    @staticmethod
    def json_to_obj(json_file):
        building = Building(
            json_file['name'],
            json_file['description']
        )
        building.custom = json_file['custom']
        return building
