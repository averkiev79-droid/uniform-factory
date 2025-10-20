"""
Generate sitemap.xml for Uniform Factory website
"""
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom
from datetime import datetime

def generate_sitemap(base_url="https://uniformfactory.ru"):
    """Generate sitemap.xml"""
    
    # Create root element
    urlset = Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    urlset.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    urlset.set('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
    
    # Static pages
    static_pages = [
        {'loc': '/', 'priority': '1.0', 'changefreq': 'daily'},
        {'loc': '/catalog', 'priority': '0.9', 'changefreq': 'daily'},
        {'loc': '/about', 'priority': '0.8', 'changefreq': 'weekly'},
        {'loc': '/portfolio', 'priority': '0.8', 'changefreq': 'weekly'},
        {'loc': '/contacts', 'priority': '0.8', 'changefreq': 'monthly'},
        {'loc': '/calculator', 'priority': '0.7', 'changefreq': 'monthly'},
        {'loc': '/privacy-policy', 'priority': '0.3', 'changefreq': 'monthly'},
        {'loc': '/user-agreement', 'priority': '0.3', 'changefreq': 'monthly'},
        {'loc': '/company-details', 'priority': '0.3', 'changefreq': 'monthly'},
    ]
    
    lastmod = datetime.now().strftime('%Y-%m-%d')
    
    for page in static_pages:
        url = SubElement(urlset, 'url')
        loc = SubElement(url, 'loc')
        loc.text = f"{base_url}{page['loc']}"
        lastmod_elem = SubElement(url, 'lastmod')
        lastmod_elem.text = lastmod
        changefreq = SubElement(url, 'changefreq')
        changefreq.text = page['changefreq']
        priority = SubElement(url, 'priority')
        priority.text = page['priority']
    
    # Generate dynamic URLs from database
    try:
        from database_sqlite import SessionLocal, ProductCategory, SQLProduct
        db = SessionLocal()
        
        # Add category pages
        categories = db.query(ProductCategory).all()
        for category in categories:
            url = SubElement(urlset, 'url')
            loc = SubElement(url, 'loc')
            loc.text = f"{base_url}/category/{category.id}"
            lastmod_elem = SubElement(url, 'lastmod')
            lastmod_elem.text = lastmod
            changefreq = SubElement(url, 'changefreq')
            changefreq.text = 'weekly'
            priority = SubElement(url, 'priority')
            priority.text = '0.8'
        
        # Add product pages
        products = db.query(SQLProduct).filter(SQLProduct.is_available == True).all()
        for product in products:
            url = SubElement(urlset, 'url')
            loc = SubElement(url, 'loc')
            loc.text = f"{base_url}/product/{product.id}"
            lastmod_elem = SubElement(url, 'lastmod')
            lastmod_elem.text = lastmod
            changefreq = SubElement(url, 'changefreq')
            changefreq.text = 'weekly'
            priority = SubElement(url, 'priority')
            priority.text = '0.7'
        
        db.close()
    except Exception as e:
        print(f"Error generating dynamic URLs: {e}")
    
    # Pretty print XML
    xml_string = tostring(urlset, encoding='unicode')
    dom = minidom.parseString(xml_string)
    pretty_xml = dom.toprettyxml(indent="  ")
    
    # Remove extra blank lines
    pretty_xml = '\n'.join([line for line in pretty_xml.split('\n') if line.strip()])
    
    return pretty_xml

if __name__ == '__main__':
    sitemap = generate_sitemap()
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)
    print("✅ Sitemap generated: sitemap.xml")
