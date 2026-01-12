// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET() {
  const results: any = {
    connection: 'unknown',
    tables: {},
    errors: [],
  };

  try {
    // Test 1: Basic connection
    console.log('Testing database connection...');
    const { error: connError } = await db
      .from('users')
      .select('count')
      .limit(0);

    if (connError) {
      results.connection = 'failed';
      results.errors.push({
        test: 'connection',
        error: connError.message,
        details: connError,
      });
    } else {
      results.connection = 'success';
    }

    // Test 2: Users table structure
    console.log('Checking users table...');
    try {
      const { data: userData, error: userError } = await db
        .from('users')
        .select('*')
        .limit(1);

      if (userError) {
        results.tables.users = {
          exists: false,
          error: userError.message,
          code: userError.code,
          details: userError.details,
          hint: userError.hint,
        };
        results.errors.push({
          test: 'users_table',
          error: userError,
        });
      } else {
        results.tables.users = {
          exists: true,
          recordCount: userData?.length || 0,
          sampleColumns: userData?.[0] ? Object.keys(userData[0]) : [],
        };
      }
    } catch (e: any) {
      results.tables.users = {
        exists: false,
        exception: e.message,
      };
    }

    // Test 3: Profiles table structure
    console.log('Checking profiles table...');
    try {
      const { data: profileData, error: profileError } = await db
        .from('profiles')
        .select('*')
        .limit(1);

      if (profileError) {
        results.tables.profiles = {
          exists: false,
          error: profileError.message,
          code: profileError.code,
        };
        results.errors.push({
          test: 'profiles_table',
          error: profileError,
        });
      } else {
        results.tables.profiles = {
          exists: true,
          recordCount: profileData?.length || 0,
          sampleColumns: profileData?.[0] ? Object.keys(profileData[0]) : [],
        };
      }
    } catch (e: any) {
      results.tables.profiles = {
        exists: false,
        exception: e.message,
      };
    }

    // Test 4: Sessions table structure
    console.log('Checking sessions table...');
    try {
      const { data: sessionData, error: sessionError } = await db
        .from('sessions')
        .select('*')
        .limit(1);

      if (sessionError) {
        results.tables.sessions = {
          exists: false,
          error: sessionError.message,
          code: sessionError.code,
        };
        results.errors.push({
          test: 'sessions_table',
          error: sessionError,
        });
      } else {
        results.tables.sessions = {
          exists: true,
          recordCount: sessionData?.length || 0,
          sampleColumns: sessionData?.[0] ? Object.keys(sessionData[0]) : [],
        };
      }
    } catch (e: any) {
      results.tables.sessions = {
        exists: false,
        exception: e.message,
      };
    }

    // Test 5: Try to insert a test user
    console.log('Testing user creation (dry run)...');
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const { data: insertData, error: insertError } = await db
        .from('users')
        .insert({
          email: testEmail,
          password_hash: null,
          auth_provider: 'email',
          provider_id: null,
          email_verified: false,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        results.tables.users.insertTest = {
          success: false,
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        };
      } else {
        results.tables.users.insertTest = {
          success: true,
          insertedId: insertData?.id,
        };

        // Clean up test user
        if (insertData?.id) {
          await db.from('users').delete().eq('id', insertData.id);
        }
      }
    } catch (e: any) {
      results.tables.users.insertTest = {
        success: false,
        exception: e.message,
      };
    }

    // Summary
    results.summary = {
      allTablesExist: 
        results.tables.users?.exists && 
        results.tables.profiles?.exists && 
        results.tables.sessions?.exists,
      canInsert: results.tables.users?.insertTest?.success || false,
      totalErrors: results.errors.length,
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Critical error during database test',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}