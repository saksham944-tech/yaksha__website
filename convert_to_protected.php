<?php
/**
 * Script to convert HTML files to protected PHP files
 * Run this once to convert all HTML files to PHP with authentication
 */

// Files that should remain public (no authentication required)
$publicFiles = [
    'index.html',
    'login.html',
    'signup.html',
    'test.html',
    'test-db.html',
    'phpmyadmin.html'
];

// Get all HTML files
$htmlFiles = glob('*.html');

echo "Converting HTML files to protected PHP files...\n\n";

foreach ($htmlFiles as $htmlFile) {
    $baseName = basename($htmlFile, '.html');
    
    // Skip public files
    if (in_array($htmlFile, $publicFiles)) {
        echo "Skipping public file: $htmlFile\n";
        continue;
    }
    
    // Read the HTML file
    $content = file_get_contents($htmlFile);
    
    // Add PHP protection at the very beginning
    $protectedContent = "<?php\n";
    $protectedContent .= "// Protected Page - Authentication Required\n";
    $protectedContent .= "session_start();\n";
    $protectedContent .= "if (!isset(\$_SESSION['logged_in']) || \$_SESSION['logged_in'] !== true) {\n";
    $protectedContent .= "    header('Location: login.html');\n";
    $protectedContent .= "    exit;\n";
    $protectedContent .= "}\n";
    $protectedContent .= "?>\n\n";
    $protectedContent .= $content;
    
    // Create PHP version
    $phpFile = $baseName . '.php';
    file_put_contents($phpFile, $protectedContent);
    
    echo "Created: $phpFile (protected version of $htmlFile)\n";
}

echo "\nDone! All HTML files (except public ones) have been converted to protected PHP files.\n";
echo "You can now delete the original HTML files or keep them as backups.\n";
?>
