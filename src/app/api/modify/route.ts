// src/app/api/get-services/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const dataDirectory = path.join(process.cwd(), 'public');

    // Read the JSON files with error handling
    let makeup = [];
    let skin = [];
    let hair = [];

    try {
      const makeupServicesFile = await fs.readFile(path.join(dataDirectory, 'makeup_services.json'), 'utf8');
      makeup = JSON.parse(makeupServicesFile);
    } catch (error) {
      console.error('Error reading makeup services:', error);
    }

    try {
      const skinServicesFile = await fs.readFile(path.join(dataDirectory, 'skin_services.json'), 'utf8');
      skin = JSON.parse(skinServicesFile);
    } catch (error) {
      console.error('Error reading skin services:', error);
    }

    try {
      const hairServicesFile = await fs.readFile(path.join(dataDirectory, 'hair_services.json'), 'utf8');
      hair = JSON.parse(hairServicesFile);
    } catch (error) {
      console.error('Error reading hair services:', error);
    }

    const allServices = {
      makeup,
      skin,
      hair,
    };

    return NextResponse.json(allServices);
  } catch (error) {
    console.error('Failed to load service data:', error);
    return NextResponse.json(
      { error: 'Error loading service data.' },
      { status: 500 }
    );
  }
}