from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User

@api_view(['POST'])
def register_user(request):
    data = request.data

    if User.objects.filter(mobile=data['mobile']).exists():
        return Response({"error": "User already exists"})

    User.objects.create(
        name=data['name'],
        mobile=data['mobile'],
        password=data['password'],
        location=data['location'],
        language=data['language']
    )

    return Response({"message": "Registered successfully"})