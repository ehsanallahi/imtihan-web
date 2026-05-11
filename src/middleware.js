import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { nextUrl } = request;
  
  // Handle CORS for API routes
  if (nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }
    
    return response;
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
