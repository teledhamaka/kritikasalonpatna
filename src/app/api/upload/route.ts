// src/app/api/apply-service/route.ts
import { NextResponse } from 'next/server';

// Mock service data
const mockServices: { [key: string]: { title: string; category: string; image: string } } = {
  '1': { title: 'Natural Makeup', category: 'makeup', image: 'https://images.unsplash.com/photo-1512496015857-aa6edfb6d3f3?w=600&h=600&fit=crop' },
  '2': { title: 'Evening Glam', category: 'makeup', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=600&fit=crop' },
  '3': { title: 'Bold Lips', category: 'makeup', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop' },
  '4': { title: 'Smoky Eyes', category: 'makeup', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e33b?w=600&h=600&fit=crop' },
  '5': { title: 'Blonde Highlights', category: 'hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop' },
  '6': { title: 'Brunette Glow', category: 'hair', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=600&fit=crop' },
  '7': { title: 'Smooth Skin', category: 'skin', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=600&fit=crop' },
  '8': { title: 'Glowing Complexion', category: 'skin', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop' },
};

export async function POST(request: Request) {
  try {
    const { image, serviceId } = await request.json();

    if (!image || !serviceId) {
      return NextResponse.json(
        { error: 'Missing image data or service ID.' },
        { status: 400 }
      );
    }

    const service = mockServices[serviceId];

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found.' },
        { status: 404 }
      );
    }

    console.log(`[AI MOCK] Applying service: '${service.title}' (ID: ${serviceId})`);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, return a placeholder transformation
    // In real implementation, this would be the AI-processed image
    const modifiedImageUrl = service.image;

    return NextResponse.json({ 
      modifiedImage: modifiedImageUrl,
      serviceName: service.title 
    });

  } catch (error) {
    console.error('Error in apply-service API:', error);
    return NextResponse.json(
      { error: 'Error processing your image.' },
      { status: 500 }
    );
  }
}