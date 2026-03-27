const fs = require('fs');
let code = fs.readFileSync('src/middleware.ts', 'utf8');

code = code.replace(
    `    if (path.startsWith('/donor-dashboard') && userRole !== 'donor') {
      if (userRole === 'admin') return NextResponse.next();
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if ((path.startsWith('/dashboard') || path.startsWith('/apply')) && userRole !== 'gharim') {
      if (userRole === 'admin') return NextResponse.next();
      return NextResponse.redirect(new URL('/donor-dashboard', request.url));   
    }`,
    `    if (path.startsWith('/donor-dashboard') && userRole !== 'donor') {
      if (userRole === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if ((path.startsWith('/dashboard') || path.startsWith('/apply')) && userRole !== 'gharim') {
      if (userRole === 'admin') return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      return NextResponse.redirect(new URL('/donor-dashboard', request.url));
    }`
);

fs.writeFileSync('src/middleware.ts', code);
