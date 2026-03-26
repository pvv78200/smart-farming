from django.db import models

class User(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, unique=True)
    password = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    language = models.CharField(max_length=10)