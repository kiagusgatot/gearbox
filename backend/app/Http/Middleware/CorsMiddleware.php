<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = [
            'https://gearbox-two.vercel.app',
            'https://gearbox-ofxm3mbsu-kiagusgatots-projects.vercel.app',
            'http://localhost:3000',
            'http://localhost:5173',
        ];

        $origin = $request->headers->get('Origin');
        $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : 'https://gearbox-two.vercel.app';

        if ($request->isMethod('OPTIONS')) {
            return response('', 204, [
                'Access-Control-Allow-Origin' => $allowOrigin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
            ]);
        }

        $response = $next($request);

        if (method_exists($response, 'header')) {
            $response->header('Access-Control-Allow-Origin', $allowOrigin);
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        } else if (isset($response->headers)) {
            $response->headers->set('Access-Control-Allow-Origin', $allowOrigin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }

        return $response;
    }
}
