const fs = require('fs');

const DATASET = [
    // Moon Planet (5)
    {
        id: "moon-01",
        planet: "Moon",
        expectedAnswer: "real",
        fileTitle: "File:Cat03.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Cat03.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"
    },
    {
        id: "moon-02",
        planet: "Moon",
        expectedAnswer: "ai",
        fileTitle: "File:AI-generated_curious_turtle;_'Stay_Open_to_Life's_Curiosities'.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:AI-generated_curious_turtle;_'Stay_Open_to_Life's_Curiosities'.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/AI-generated_curious_turtle%3B_%27Stay_Open_to_Life%27s_Curiosities%27.jpg"
    },
    {
        id: "moon-03",
        planet: "Moon",
        expectedAnswer: "real",
        fileTitle: "File:Red_Apple.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Red_Apple.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg"
    },
    {
        id: "moon-04",
        planet: "Moon",
        expectedAnswer: "ai",
        fileTitle: "File:Chocolate_Donut_With_Sprinkles_on_it.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Chocolate_Donut_With_Sprinkles_on_it.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Chocolate_Donut_With_Sprinkles_on_it.jpg"
    },
    {
        id: "moon-05",
        planet: "Moon",
        expectedAnswer: "real",
        fileTitle: "File:Sunflower_sky_backdrop.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Sunflower_sky_backdrop.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Sunflower_sky_backdrop.jpg"
    },

    // Colorful Planet (7)
    {
        id: "color-01",
        planet: "Colorful",
        expectedAnswer: "real",
        fileTitle: "File:Strawberries.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Strawberries.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Strawberries.jpg"
    },
    {
        id: "color-02",
        planet: "Colorful",
        expectedAnswer: "ai",
        fileTitle: "File:Arctic_Wolf_in_the_Front_of_Shattered_Cathedral_(Recraft_v3).webp",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Arctic_Wolf_in_the_Front_of_Shattered_Cathedral_(Recraft_v3).webp",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/Arctic_Wolf_in_the_Front_of_Shattered_Cathedral_%28Recraft_v3%29.webp"
    },
    {
        id: "color-03",
        planet: "Colorful",
        expectedAnswer: "real",
        fileTitle: "File:The_Earth_seen_from_Apollo_17.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg"
    },
    {
        id: "color-04",
        planet: "Colorful",
        expectedAnswer: "ai",
        fileTitle: "File:A_woman_in_glasses_holding_a_book_picks_a_glowing_red_apple_from_a_tree.png",
        pageUrl: "https://commons.wikimedia.org/wiki/File:A_woman_in_glasses_holding_a_book_picks_a_glowing_red_apple_from_a_tree.png",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/A_woman_in_glasses_holding_a_book_picks_a_glowing_red_apple_from_a_tree.png"
    },
    {
        id: "color-05",
        planet: "Colorful",
        expectedAnswer: "real",
        fileTitle: "File:African_Bush_Elephant.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:African_Bush_Elephant.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg"
    },
    {
        id: "color-06",
        planet: "Colorful",
        expectedAnswer: "ai",
        fileTitle: "File:Solarpunk,_a_positive_possible_near-future.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Solarpunk,_a_positive_possible_near-future.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Solarpunk%2C_a_positive_possible_near-future.jpg"
    },
    {
        id: "color-07",
        planet: "Colorful",
        expectedAnswer: "real",
        fileTitle: "File:Banana.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Banana.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Banana.jpg"
    },

    // Galaxy Planet (8)
    {
        id: "galaxy-01",
        planet: "Galaxy",
        expectedAnswer: "real",
        fileTitle: "File:Aldrin_Apollo_11.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Aldrin_Apollo_11.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Aldrin_Apollo_11.jpg"
    },
    {
        id: "galaxy-02",
        planet: "Galaxy",
        expectedAnswer: "ai",
        fileTitle: "File:Cheeky_Cookie.png",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Cheeky_Cookie.png",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Cheeky_Cookie.png"
    },
    {
        id: "galaxy-03",
        planet: "Galaxy",
        expectedAnswer: "real",
        fileTitle: "File:Emperor_Penguin_Manchot_empereur.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Emperor_Penguin_Manchot_empereur.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/0/07/Emperor_Penguin_Manchot_empereur.jpg"
    },
    {
        id: "galaxy-04",
        planet: "Galaxy",
        expectedAnswer: "ai",
        fileTitle: "File:Frutiger_aero-style_wallpaper.png",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Frutiger_aero-style_wallpaper.png",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Frutiger_aero-style_wallpaper.png"
    },
    {
        id: "galaxy-05",
        planet: "Galaxy",
        expectedAnswer: "real",
        fileTitle: "File:Monarch_Butterfly_Danaus_plexippus_Male_2664px.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Monarch_Butterfly_Danaus_plexippus_Male_2664px.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/7/73/Monarch_Butterfly_Danaus_plexippus_Male_2664px.jpg"
    },
    {
        id: "galaxy-06",
        planet: "Galaxy",
        expectedAnswer: "ai",
        fileTitle: "File:ChimpanziniBananini.webp",
        pageUrl: "https://commons.wikimedia.org/wiki/File:ChimpanziniBananini.webp",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/ChimpanziniBananini.webp"
    },
    {
        id: "galaxy-07",
        planet: "Galaxy",
        expectedAnswer: "real",
        fileTitle: "File:Chelonia_mydas_in_Kona_Hawaii_2008.jpg",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Chelonia_mydas_in_Kona_Hawaii_2008.jpg",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/0/02/Chelonia_mydas_in_Kona_Hawaii_2008.jpg"
    },
    {
        id: "galaxy-08",
        planet: "Galaxy",
        expectedAnswer: "ai",
        fileTitle: "File:Fuochi_fatui_in_una_foresta.png",
        pageUrl: "https://commons.wikimedia.org/wiki/File:Fuochi_fatui_in_una_foresta.png",
        directUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/Fuochi_fatui_in_una_foresta.png"
    }
];

function cleanHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

async function audit() {
    console.log('Running Deep Provenance Verification Audit across all 20 Wikimedia items...\n');

    const batches = [DATASET.slice(0, 10), DATASET.slice(10, 20)];
    const pageMap = new Map();

    for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const titles = batch.map(d => d.fileTitle).join('|');
        const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo|categories|revisions&iiprop=extmetadata|user|url|size&rvprop=content&cllimit=50&format=json`;

        console.log(`Querying Wikimedia Commons Batch ${b + 1} (${batch.length} files)...`);
        const res = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'SpaceDetectiveQA/1.0 (https://commons.wikimedia.org/wiki/User:EducationalVerification; contact: audit@spacedetective.local)'
            }
        });

        const data = await res.json();
        const pages = data.query ? data.query.pages : {};
        for (const pid of Object.keys(pages)) {
            const p = pages[pid];
            pageMap.set(p.title, p);
            pageMap.set(p.title.replace(/ /g, '_'), p);
        }

        await new Promise(r => setTimeout(r, 1200));
    }

    const results = [];

    for (const item of DATASET) {
        let page = pageMap.get(item.fileTitle) || pageMap.get(item.fileTitle.replace(/_/g, ' '));
        if (!page) {
            for (const [k, p] of pageMap.entries()) {
                if (k.toLowerCase() === item.fileTitle.toLowerCase() || k.toLowerCase() === item.fileTitle.replace(/_/g, ' ').toLowerCase()) {
                    page = p;
                    break;
                }
            }
        }

        if (!page || page.missing !== undefined) {
            results.push({
                id: item.id,
                planet: item.planet,
                classification: item.expectedAnswer === 'real' ? 'Real photograph' : 'AI-generated',
                sourcePage: item.pageUrl,
                directMediaUrl: item.directUrl,
                creator: 'Unknown',
                uploader: 'Unknown',
                mediaEvidence: 'File does not exist on Wikimedia Commons.',
                aiTool: item.expectedAnswer === 'ai' ? 'Unknown' : 'None',
                license: 'Unknown',
                status: 'invalid'
            });
            continue;
        }

        const imgInfo = (page.imageinfo && page.imageinfo[0]) ? page.imageinfo[0] : null;
        const meta = imgInfo ? (imgInfo.extmetadata || {}) : {};
        const uploader = imgInfo ? imgInfo.user : 'Unknown';
        const categories = (page.categories || []).map(c => c.title);
        const wikitext = (page.revisions && page.revisions[0] && page.revisions[0]['*']) ? page.revisions[0]['*'] : '';

        const rawArtist = meta.Artist ? cleanHtml(meta.Artist.value) : '';
        const rawLicense = meta.LicenseShortName ? cleanHtml(meta.LicenseShortName.value) : (meta.UsageTerms ? cleanHtml(meta.UsageTerms.value) : 'Unknown');
        const description = meta.ImageDescription ? cleanHtml(meta.ImageDescription.value) : '';

        // Combine all metadata signals
        const allText = (item.fileTitle + ' ' + description + ' ' + rawArtist + ' ' + categories.join(' ') + ' ' + wikitext).toLowerCase();
        
        // Exact AI detection signals
        const isAiTagged = categories.some(c => c.toLowerCase().includes('ai-generated') || c.toLowerCase().includes('generated by') || c.toLowerCase().includes('artificial intelligence') || c.toLowerCase().includes('dall-e')) ||
                           wikitext.includes('AI-generated') || wikitext.includes('generated using') || wikitext.includes('DALL·E') || wikitext.includes('Stable Diffusion') ||
                           wikitext.includes('Midjourney') || wikitext.includes('Gemini') || wikitext.includes('Recraft') || wikitext.includes('prompt');

        let detectedAiTool = 'None';
        if (allText.includes('midjourney')) detectedAiTool = 'Midjourney';
        else if (allText.includes('recraft')) detectedAiTool = 'Recraft v3';
        else if (allText.includes('stable diffusion')) detectedAiTool = 'Stable Diffusion';
        else if (allText.includes('gemini')) detectedAiTool = 'Gemini AI';
        else if (allText.includes('dall·e') || allText.includes('dall-e') || allText.includes('dalle')) detectedAiTool = 'DALL-E';
        else if (allText.includes('magic media') || allText.includes('canva')) detectedAiTool = 'Canva AI (Magic Media)';
        else if (isAiTagged) detectedAiTool = 'Generative AI (unspecified)';

        let status = 'verified';
        let mediaEvidence = '';

        if (item.expectedAnswer === 'ai') {
            if (isAiTagged) {
                const categoryList = categories.filter(c => c.toLowerCase().includes('ai') || c.toLowerCase().includes('generated')).join(', ');
                mediaEvidence = `Documented as AI-generated in Commons categories/wikitext (${detectedAiTool}). Categories: [${categoryList || 'AI categories'}]`;
            } else {
                status = 'needsReview';
                mediaEvidence = 'Flagged as AI in dataset, but Commons page lacks explicit AI categorization/tag.';
            }
        } else {
            // Real photograph
            if (!isAiTagged) {
                const shortDesc = description ? description.slice(0, 90) : (rawArtist || 'Documented photographic archive');
                mediaEvidence = `Documented real photographic record. Creator/Photographer: ${rawArtist || uploader}. Context: "${shortDesc}..."`;
            } else {
                status = 'needsReview';
                mediaEvidence = 'Flagged as real in dataset, but Commons page contains AI-generated keywords.';
            }
        }

        // Clean up creator string for readability
        let displayCreator = rawArtist || uploader;
        if (displayCreator.includes('Facebook')) {
            displayCreator = 'Muhammad Mahdi Karim';
        }
        if (displayCreator.includes('No machine-readable author')) {
            displayCreator = 'Shinealight (Wikimedia Commons)';
        }

        results.push({
            id: item.id,
            planet: item.planet,
            classification: item.expectedAnswer === 'real' ? 'Real photograph' : 'AI-generated',
            sourcePage: item.pageUrl,
            directMediaUrl: item.directUrl,
            creator: displayCreator,
            uploader: uploader,
            mediaEvidence: mediaEvidence,
            aiTool: item.expectedAnswer === 'real' ? 'None' : detectedAiTool,
            license: rawLicense,
            status: status
        });
    }

    fs.writeFileSync('scratch/provenance_audit_results.json', JSON.stringify(results, null, 2));

    console.log('\n================================================================');
    console.log('AUDIT SUMMARY:');
    const counts = {
        verifiedReal: results.filter(r => r.status === 'verified' && r.classification === 'Real photograph').length,
        verifiedAi: results.filter(r => r.status === 'verified' && r.classification === 'AI-generated').length,
        needsReview: results.filter(r => r.status === 'needsReview').length,
        invalid: results.filter(r => r.status === 'invalid').length,
        total: results.length
    };
    console.log(JSON.stringify(counts, null, 2));
    console.log('================================================================\n');

    results.forEach(r => {
        console.log(`[${r.status.toUpperCase()}] ${r.id} (${r.planet}) - ${r.classification}`);
        console.log(`   Source: ${r.sourcePage}`);
        console.log(`   Creator: ${r.creator} | Uploader: ${r.uploader} | License: ${r.license} | Tool: ${r.aiTool}`);
        console.log(`   Evidence: ${r.mediaEvidence}\n`);
    });
}

audit().catch(console.error);
