# Delirio Vertical Carousel Image Generation Prompt Pack

## Purpose

Use this document to generate three original, photorealistic marketing images for the Delirio website vertical carousel:

1. **Start**: entering and beginning a planned workout
2. **See the Rep**: receiving live movement guidance during a strength exercise
3. **Keep Going**: completing a workout and seeing what comes next

These images replace third-party placeholder photography. They should form one continuous visual story featuring the same fictional person. The person must feel recognizable to Delirio's women-first, busy-professional audience without implying that she is an actual customer, a specific patient, or a public figure.

## Important workflow for crisp app interfaces

Do not ask the image model to redraw the Delirio interface from memory. Image models frequently corrupt interface typography, icons, and spacing.

For each image:

1. Upload the corresponding Delirio screenshot listed in the prompt.
2. Generate the photorealistic lifestyle scene.
3. Composite the uploaded screenshot into the upper-right overlay exactly as supplied.
4. Preserve the screenshot pixels, wording, colors, and proportions. Do not reinterpret or regenerate its contents.
5. If exact screenshot preservation is not possible in one generation, generate the clean photograph first. Then start an image-edit turn using the photograph as the edit target and the screenshot as a supporting insert.

## Files to upload with the prompts

- Start: `src/images/appScreenshots/clickStart.png`
- See the Rep: `src/images/appScreenshots/isession.png`
- Keep Going: `src/images/appScreenshots/postWorkotPlanning.png`

The screenshots are portrait images at 902 by 1912 pixels. Keep their original aspect ratio when used inside the overlay.

## Shared identity reference for all three images

Create one entirely fictional adult woman and preserve her identity across the three scenes.

- Approximate age: 36 to 42
- Presentation: professional, approachable, contemporary, grounded
- Body: realistic average-to-athletic build, visibly strong enough to train but not fitness-model lean or hyper-defined
- Face: completely fictional and not similar to any celebrity, influencer, athlete, model, or identifiable real person
- Hair: shoulder-length dark brown hair, practical low ponytail during training
- Skin: natural texture, subtle pores, realistic fine lines, no plastic retouching
- Wardrobe: simple unbranded charcoal training leggings, muted plum or deep olive training top, clean neutral trainers
- Accessories: simple smartwatch with no visible brand, small stud earrings if visible
- Emotional progression:
  - Start: mentally transitioning from work to training
  - See the Rep: focused and actively learning
  - Keep Going: satisfied, calm, and clear about the next step

If ChatGPT cannot reliably preserve the same person across separate generations, use the first approved Start image as an identity and wardrobe reference for the other two images. State explicitly that the fictional woman's face, age, body proportions, hair, outfit family, and overall identity must remain consistent.

## Shared photographic direction

- Use case: photorealistic-natural
- Asset type: premium consumer fitness landing-page carousel photography
- Visual standard: high-end editorial advertising photography with believable documentary detail
- Camera character: full-frame mirrorless camera, natural perspective, approximately 35mm to 50mm equivalent lens
- Depth of field: shallow enough to separate the subject, deep enough that hands, phone, and exercise position remain understandable
- Shutter: freeze meaningful movement cleanly; do not create implausible motion blur on the face, hands, or phone
- Lighting: natural directional window light combined with subtle practical interior light
- Color grade: restrained cinematic contrast, clean skin tones, rich blacks, slightly warm highlights, neutral shadows
- Texture: preserve fabric weave, skin texture, floor texture, hair detail, and believable reflections
- Retouching: premium but realistic; no airbrushed skin or exaggerated body reshaping
- Mood: capable, calm, private, modern, and quietly motivating
- Environment: polished urban apartment fitness area or refined residential building gym that plausibly belongs to a busy professional
- Branding: no third-party logos, product marks, gym logos, clothing logos, posters, watermarks, signatures, or recognizable branded equipment
- Fitness equipment: generic dumbbells, bench, mat, and minimal storage
- Safety: believable exercise technique and stable equipment placement
- Diversity: portray an adult woman with a real, attainable body and believable life context, not a stereotypical stock fitness model

## Shared overlay direction

The app overlay creates dramatic irony: the viewer can see the Delirio guidance that is supporting the person, even though the photographed person is simply living through the moment.

- Place the overlay in the upper-right portion of the final image.
- Treat it as a premium editorial interface inset, not a physical second phone floating in the room.
- Preserve the supplied screenshot exactly inside the inset.
- Crop the screenshot only when specifically instructed below.
- Do not replace screenshot text with generated text.
- Do not add invented interface controls.
- Do not add an Apple logo, phone brand, app-store badge, or third-party system branding.
- Use a thin neutral frame or subtle glass card around the screenshot.
- Allow a very soft shadow or atmospheric separation from the scene.
- Keep the overlay crisp and readable at website scale.
- The overlay should occupy roughly 22 to 28 percent of the final image width.
- The overlay must never cover the subject's face, working hand, main exercise joint, or primary equipment.
- Keep at least 5 percent padding between the overlay and the top and right edges.
- The overlay can slightly extend into negative space near the subject, but it must not look pasted on carelessly.
- Use consistent overlay scale, corner radius, and shadow language across all three images.
- Do not render tiny illegible decorative text around the overlay.
- Do not add callout arrows, fake annotations, captions, charts, or floating metrics unless they are already present in the uploaded screenshot.

## Global negative prompt

Apply this entire exclusion list to every image:

- no celebrity, influencer, public figure, professional athlete, or identifiable real person
- no resemblance to an existing commercial campaign or famous photograph
- no copied stock-photo composition
- no third-party logos or trademarks
- no visible text outside the supplied Delirio screenshot
- no watermark, signature, photographer mark, stock watermark, or metadata label
- no malformed hands, extra fingers, fused fingers, duplicated limbs, missing limbs, twisted wrists, or anatomically impossible joints
- no duplicate person, background clone, reflection clone, or ghost limb
- no impossible phone geometry
- no melted screen, fake interface, corrupted typography, or invented app labels
- no excessive beauty retouching, waxy skin, artificial teeth, doll-like eyes, or fashion-editorial body distortion
- no hyper-muscular physique, competition physique, or unrealistically low body fat
- no medical imagery, injection, medication package, scale, before-and-after comparison, or explicit weight-loss claim
- no implication that body shape reveals medication use or health status
- no injury, pain expression, collapse, unsafe loading, unstable bench, or dangerous form
- no hospital, clinic, sterile medical room, neon sci-fi gym, nightclub lighting, or luxury fantasy mansion
- no excessive sweat, sexualized pose, voyeuristic crop, or emphasis on chest or glutes
- no fisheye distortion, extreme wide-angle distortion, tilted architecture, or surreal perspective
- no heavy HDR, crushed facial shadows, blown highlights, orange skin, teal-orange cliché, or oversaturated colors
- no exaggerated bokeh that hides the training context
- no text generated outside the exact uploaded app screenshot

---

# Image 1: Start

## Output specification

- Final aspect ratio: 1:1 square
- Preferred output: 1536 by 1536 pixels or the highest available square resolution
- Carousel use: Start cell
- Upload as supporting insert: `clickStart.png`
- Suggested final filename: `start-generated-v1.webp`

## Primary generation prompt

```text
Use case: photorealistic-natural
Asset type: square landing-page carousel image for a premium AI fitness coaching product

Primary request:
Create an entirely original, copyright-safer, photorealistic editorial photograph of a fictional 38-year-old professional woman beginning a strength workout after a workday. This is the first moment in a three-image story. She has just changed into simple unbranded training clothes and is transitioning from planning to action. She is not posing for the camera. She is looking toward a phone positioned securely on a low stand near her workout mat as she reaches to begin the session. Her expression should communicate a small but meaningful shift from mental fatigue to clear intention.

Input image:
The uploaded clickStart.png is a supporting insert and the exact Delirio app screen that must appear inside the editorial overlay. Preserve the supplied screenshot pixels and interface design. Do not redraw, rewrite, simplify, or invent its interface.

Fictional subject:
Use the shared fictional Delirio customer identity. Adult woman, approximately 38 years old, shoulder-length dark brown hair in a practical low ponytail, natural skin texture, average-to-athletic body, realistic proportions, approachable and contemporary. She should look like a busy professional who trains for strength and health, not a fitness model. Dress her in charcoal training leggings, a muted plum performance top with no logo, and clean neutral trainers. Include a small neutral smartwatch with no visible branding.

Scene:
A refined but attainable urban apartment fitness corner at early evening. Include a rolled or partially opened exercise mat, one pair of generic dumbbells, a simple bench or low platform, and a discreet water bottle with no branding. A work tote or closed laptop may sit softly out of focus near the edge of the scene to suggest the transition from work, but the work object must remain secondary. The room should feel lived in, calm, organized enough to begin, and not like a commercial gym set.

Action and body language:
Capture the instant immediately before the workout starts. The woman is in a natural three-quarter view. One knee may be bent as she adjusts her stance near the mat. One hand reaches toward or has just left the phone stand. The other hand rests naturally at her side or lightly adjusts a wrist strap. Her posture is upright but not staged. She appears to have received enough direction to begin without deliberating further.

Composition:
Square 1:1 composition. Place the woman primarily in the left-center and lower-center of the frame. Keep her face, reaching hand, phone stand, and nearest dumbbell fully visible. Reserve uncluttered negative space in the upper-right quadrant for the app overlay. Keep the subject large enough to feel emotionally present but leave breathing room around her. The composition must remain effective when the website displays it as a square with mild responsive cropping.

App overlay:
Composite the exact uploaded clickStart.png screenshot into a crisp portrait inset in the upper-right. The inset should occupy approximately 23 percent of the image width and preserve the original 902:1912 aspect ratio. Show the most important upper and middle portion of the supplied interface where the user can understand that a workout is ready to start. Do not corrupt any visible text. Use a thin dark neutral frame, approximately 1 to 2 pixels at final resolution, with a restrained corner radius and a soft diffused shadow. The overlay is a viewer-facing editorial layer, not a physical object in the room. It should feel integrated through consistent lighting and clean spacing while remaining perfectly readable.

Lighting:
Use soft directional daylight from a large window on camera-left combined with a subtle warm practical lamp deeper in the room. Preserve detail in the dark training clothes. Use a restrained highlight along the subject's cheek, forearm, and shoulder. Avoid dramatic hard shadows. The app overlay remains evenly legible and is not tinted by the room lighting.

Camera and rendering:
Full-frame mirrorless camera look, 40mm equivalent lens, eye-level or slightly lower camera position, approximately f/3.2. Natural perspective. Freeze the reaching hand cleanly. Fine-grained realistic detail. Premium advertising finish without appearing synthetic. Realistic skin, hair flyaways, clothing folds, mat texture, phone reflections, and room surfaces.

Color direction:
Charcoal, muted plum, warm off-white, dark wood, and restrained olive accents. Clean neutral skin tones. Rich but not crushed blacks. Avoid neon colors and avoid a generic blue corporate color grade.

Narrative goal:
The image must communicate: the plan is ready, the decision load has been reduced, and the person can begin. It should feel like Delirio fits into a real workday rather than requiring a perfect fitness lifestyle.

Legal and originality constraints:
Create an entirely fictional person and an original composition. Do not imitate any named photographer, living artist, celebrity, campaign, stock image, or identifiable real person. Do not include any third-party logo, trademark, copyrighted poster, branded clothing, branded equipment, or watermark. The only supplied branded visual allowed is the exact Delirio app screenshot provided by the user.

Avoid:
Apply the complete Global negative prompt from the prompt pack. In particular, no malformed hands, no invented UI, no corrupted interface text, no hyper-fit model, no medication imagery, no medical implication, no unsafe equipment, no sexualized framing, and no stock-photo smile toward the camera.
```

## Start repair prompt if the interface is distorted

```text
Edit only the upper-right app overlay. Replace the distorted or generated interface with the exact uploaded clickStart.png pixels. Preserve the screenshot's original aspect ratio, colors, typography, icons, and spacing. Do not redraw any interface element. Keep the fictional woman, her face, hands, body, clothing, pose, room, equipment, lighting, crop, and color grade completely unchanged. Maintain the existing overlay size and placement. The corrected interface must be crisp at full resolution and readable without looking brighter than the surrounding photograph.
```

---

# Image 2: See the Rep

## Output specification

- Final aspect ratio: 2:3 portrait
- Preferred output: 1024 by 1536 pixels or the highest available 2:3 portrait resolution
- Carousel use: See the Rep cell
- Upload as supporting insert: `isession.png`
- Upload the approved Start image as an identity reference
- Suggested final filename: `see-the-rep-generated-v1.webp`

## Primary generation prompt

```text
Use case: photorealistic-natural
Asset type: portrait landing-page carousel image for a premium AI fitness coaching product

Primary request:
Create an entirely original, copyright-safer, photorealistic editorial photograph of the exact same fictional woman from the approved Start image performing a controlled strength-training repetition while Delirio provides live session context. This is the second moment in the three-image story. The photograph should capture concentration, physical effort, and useful guidance without portraying elite athletic performance.

Input images:
Image 1, the approved Start image, is the identity, wardrobe, age, body-proportion, environment, and visual-style reference. Preserve the fictional woman's identity exactly enough that viewers understand this is the same person later in the same workout.
Image 2, the uploaded isession.png, is a supporting insert and the exact Delirio live-session screen that must appear inside the editorial overlay. Preserve its pixels and interface design. Do not redraw, rewrite, or invent the interface.

Fictional subject continuity:
Maintain the same fictional 38-year-old woman, facial structure, skin tone, hair color, low ponytail, realistic average-to-athletic body, charcoal leggings, muted plum top, neutral trainers, and unbranded smartwatch. Her face must remain recognizable as the same fictional individual. Do not make her younger, leaner, more muscular, more glamorous, or more heavily retouched than in Image 1.

Exercise:
Show a controlled dumbbell Romanian deadlift or a stable goblet squat at a technically plausible point in the repetition. Prefer a dumbbell Romanian deadlift if the image model can render the hinge position, hands, dumbbells, and spine safely. Otherwise use a goblet squat with one generic dumbbell held securely at chest height. Use a moderate, believable load. Her feet are stable. Her knees, spine, shoulders, wrists, and grip look anatomically plausible. She is focused on the movement, not looking at the camera.

Scene continuity:
Use the same attainable urban apartment fitness area or residential gym established in the Start image. Preserve the broad room architecture, flooring, window-light direction, mat, dumbbell style, and restrained palette. Move incidental objects only as necessary for safe exercise space. The phone should be visible on a stable stand at an angle capable of seeing the movement, but it must not obstruct the exercise path.

Composition:
Portrait 2:3 composition. Frame from approximately mid-shin to slightly above the subject's head, or use a full-body composition if it remains legible. Place the woman's body primarily along the left and center vertical axes. Preserve clear visibility of the exercise position and the joints relevant to the movement. Reserve the upper-right quadrant for the live-session overlay. Do not place the overlay over her face, shoulders, hands, dumbbells, hip hinge, or knee line. Leave enough room around the overlay that it reads as a deliberate layer rather than a corner sticker.

App overlay:
Composite the exact uploaded isession.png screenshot into a crisp portrait inset in the upper-right. The inset should occupy approximately 24 to 27 percent of the final image width while remaining large enough to identify it as a live Delirio session. Preserve the screenshot's 902:1912 aspect ratio. Favor the crop that most clearly communicates an active coaching session, visible exercise context, or live rep guidance. Do not generate replacement text. Do not invent a rep score, percentage, warning, or medical claim. Use the same frame thickness, corner radius, and shadow language as the Start overlay to create a coherent carousel system.

Relationship between person and overlay:
The viewer should immediately connect the exercise to the app state. The phone stand visible in the room establishes that Delirio can observe supported movement details. The upper-right overlay reveals what the coaching experience looks like. The composition should not imply surveillance or secret recording. It should communicate consensual app use and active coaching support.

Expression and emotional direction:
Focused, calm effort. Slight tension appropriate to the repetition. No pain, fear, grimace, or exaggerated strain. She should look capable and engaged, not effortless. The emotion says: I know what to adjust and I can keep moving.

Lighting:
Maintain the same directional window light and warm practical fill as the Start image. Slightly increase contrast around the subject's form so the exercise position is visually understandable. Preserve detail in dark clothing and dumbbells. No harsh spotlight, gym neon, or cinematic smoke.

Camera and rendering:
Full-frame mirrorless look, 45mm to 50mm equivalent lens, approximately f/3.5 to f/4. Use a shutter fast enough to preserve crisp hands, dumbbells, face, and clothing. Camera height should be near hip or waist level to show the movement without distorting proportions. Natural perspective. Premium editorial realism with accurate anatomy and believable weight distribution.

Color direction:
Continue charcoal, muted plum, warm off-white, dark wood, and restrained olive. Allow the Delirio overlay to provide the strongest interface contrast. Do not color-grade the photo so aggressively that the screenshot looks foreign to the scene.

Narrative goal:
The image must communicate: guidance is present during the repetition, uncertainty can become a specific adjustment, and an ordinary person can receive useful context without needing to perform like an athlete. This is fitness coaching, not diagnosis or medical monitoring.

Legal and originality constraints:
Create an entirely fictional person and original composition. Do not imitate any named photographer, artist, public figure, athlete, campaign, or source photo. Do not include third-party brands, gym logos, equipment logos, recognizable posters, watermarks, or copyrighted background art. The only supplied branded visual allowed is the exact Delirio app screenshot.

Avoid:
Apply the complete Global negative prompt. Pay special attention to safe joint positions, anatomically correct hands, correct dumbbell count, realistic grip, stable feet, straight equipment edges, no duplicated phone, no fake biomechanical skeleton overlay, no medical reading, and no corrupted isession.png interface.
```

## See the Rep repair prompt for anatomy or interface errors

```text
Repair only the identified anatomy and interface defects. Keep the fictional woman's identity, age, realistic body, clothing, environment, lighting, camera angle, and overall composition unchanged. Correct the hands to five anatomically plausible fingers each, correct the wrist and elbow alignment, ensure exactly the intended number of dumbbells, maintain a stable and safe exercise position, and remove any duplicated limbs or equipment. Replace the upper-right interface with the exact uploaded isession.png pixels without redrawing its text or icons. Do not make the subject more muscular, leaner, younger, or more polished.
```

---

# Image 3: Keep Going

## Output specification

- Final aspect ratio: 1:1 square
- Preferred output: 1536 by 1536 pixels or the highest available square resolution
- Carousel use: Keep Going cell
- Upload as supporting insert: `postWorkotPlanning.png`
- Upload the approved Start or See the Rep image as an identity reference
- Suggested final filename: `keep-going-generated-v1.webp`

## Primary generation prompt

```text
Use case: photorealistic-natural
Asset type: square landing-page carousel image for a premium AI fitness coaching product

Primary request:
Create an entirely original, copyright-safer, photorealistic editorial photograph of the same fictional woman immediately after completing the strength session shown in the earlier carousel images. This is the third moment in the story. She has finished today's work and can see what comes next. The image should feel emotionally rewarding but understated, capturing calm continuity instead of a dramatic finish-line celebration.

Input images:
Image 1, the approved earlier carousel image, is the identity, wardrobe, environment, and photographic-style reference. Preserve the fictional woman's face, age, body proportions, hair, clothing family, and overall identity.
Image 2, the uploaded postWorkotPlanning.png, is a supporting insert and the exact Delirio post-workout planning screen that must appear inside the upper-right overlay. Preserve the supplied pixels, typography, colors, icons, and spacing. Do not redraw or rewrite the interface.

Fictional subject continuity:
Show the same fictional 38-year-old professional woman. Keep her natural skin texture, realistic average-to-athletic body, dark brown low ponytail, charcoal leggings, muted plum training top, neutral trainers, and unbranded smartwatch. Add only subtle and realistic post-workout details: a few loose hair strands, mild warmth in the cheeks, and light perspiration appropriate to moderate strength training. Do not transform her appearance or body between scenes.

Scene:
The same urban apartment training area or residential gym in early evening, now slightly quieter. Dumbbells are safely placed together on the floor, not scattered. The mat is still open. A towel and unbranded water bottle may be nearby. The woman is seated at the edge of a simple bench or kneeling comfortably beside the mat, holding or looking at her phone. The scene should suggest that the session has ended and the next decision is already becoming clear.

Action and body language:
Capture the woman in a natural recovery posture. Her breathing has settled. Her shoulders are relaxed. She looks at the phone with a subtle expression of recognition or relief, not a large smile and not a posed victory gesture. One hand holds the phone naturally. The other may rest on her thigh or hold the water bottle. Her body language should say: I finished this session, and I know how to continue.

Composition:
Square 1:1 composition. Place the woman in the left-center or lower-left, seated or kneeling at a visually stable diagonal. Keep her face and phone visible without turning the phone screen directly toward the camera. Reserve the upper-right quadrant for the post-workout Delirio overlay. Use the equipment and room lines to guide the eye from the woman toward the overlay. Maintain enough negative space for the interface while keeping the scene emotionally intimate.

App overlay:
Composite the exact uploaded postWorkotPlanning.png screenshot into a crisp portrait inset in the upper-right. The inset should occupy approximately 23 to 26 percent of the final image width and preserve its original 902:1912 aspect ratio. Select a crop that makes post-workout planning or the next-session context visually clear. Preserve every visible interface pixel. Do not generate replacement wording, fake dates, invented recommendations, or medical advice. Match the exact frame thickness, corner radius, scale language, and soft shadow used in the Start and See the Rep images.

Visual relationship:
The photographed phone can remain partially turned away or softly out of focus. The editorial overlay reveals the relevant Delirio state to the viewer. This creates the intended dramatic irony without making the scene feel invasive. It must be obvious that the woman chose to use the app. Do not imply hidden tracking, involuntary monitoring, or medical surveillance.

Lighting:
Continue the same window direction, but allow the scene to feel slightly warmer and calmer than the active-rep image. Use a soft practical lamp or late-day warmth to create closure. Keep the face naturally illuminated. Preserve realistic phone reflections and fabric texture. Do not overuse orange light or cinematic haze.

Camera and rendering:
Full-frame mirrorless look, 40mm to 50mm equivalent lens, approximately f/3.2. Eye-level or slightly above seated eye level. Natural perspective. Crisp face, hands, and phone silhouette. Realistic depth of field. High-end consumer campaign quality with documentary credibility.

Color direction:
Maintain the series palette: charcoal, muted plum, warm off-white, dark wood, and restrained olive. Slightly warmer highlights than the See the Rep image are acceptable. Maintain consistent blacks and skin tones across all three images.

Narrative goal:
The image must communicate: finishing today produces a clear next step. The user does not need to reconstruct the plan after every session. Delirio carries useful context forward while the user remains in control.

Legal and originality constraints:
Create an entirely fictional adult and an original composition. Do not imitate any named photographer, public figure, influencer, athlete, campaign, stock photograph, or copyrighted artwork. Do not include third-party logos, trademarks, branded clothing, branded equipment, recognizable posters, watermarks, or signatures. The only supplied branded visual allowed is the exact Delirio screenshot.

Avoid:
Apply the complete Global negative prompt. In particular, no before-and-after implication, no weight-loss claim, no medical symbolism, no dramatic exhaustion, no pain, no excessive sweat, no fake interface text, no malformed hand holding the phone, no extra phone, no stock-photo thumbs-up, and no celebratory pose directed at the camera.
```

## Keep Going repair prompt if identity drifts

```text
Edit the generated Keep Going image so the woman matches the approved fictional identity reference. Restore the same facial structure, approximate age, skin tone, realistic body proportions, dark brown low ponytail, charcoal leggings, muted plum top, neutral trainers, and natural level of retouching. Keep the current post-workout pose, environment, composition, lighting, and overlay location unchanged. Preserve the exact postWorkotPlanning.png interface pixels. Do not beautify, slim, de-age, or make the subject more athletic than the reference.
```

---

# Final consistency review prompt

After generating all three images, upload the complete set and use this review prompt:

```text
Review these three Delirio carousel images as one continuous premium campaign. Do not regenerate them yet. Identify every visible inconsistency across:

1. fictional person's face and identity
2. approximate age
3. skin tone and skin texture
4. body proportions and attainable fitness level
5. hair color, length, and ponytail
6. clothing color and construction
7. smartwatch and accessories
8. room architecture, flooring, window direction, equipment, and time of day
9. camera perspective, focal length character, depth of field, and color grade
10. overlay width percentage, screenshot aspect ratio, corner radius, border, shadow, and upper-right spacing
11. exact preservation of the supplied Delirio screenshot pixels
12. anatomical accuracy and safe exercise technique
13. absence of third-party logos, watermarks, copyrighted art, public figures, or recognizable commercial imagery
14. responsive crop safety for square and portrait carousel presentation

Return a concise correction list for each image. Prioritize corrections that affect identity continuity, legal-risk reduction, interface fidelity, anatomy, and immediate comprehension. Do not suggest changing the fictional person into a fitness model. Do not add medical or weight-loss claims.
```

# Final export checklist

Before placing the assets in the website, confirm:

- [ ] Start is a square image.
- [ ] See the Rep is a 2:3 portrait image.
- [ ] Keep Going is a square image.
- [ ] The same fictional woman appears in all three.
- [ ] No image resembles a celebrity or identifiable real person.
- [ ] No third-party brands or watermarks are visible.
- [ ] Every hand and limb is anatomically plausible.
- [ ] The exercise technique looks stable and safe.
- [ ] Each supplied Delirio screenshot is preserved accurately.
- [ ] Overlay text remains legible at carousel size.
- [ ] The overlay does not cover the face, hands, or key exercise joints.
- [ ] The upper-right overlay placement is consistent across the series.
- [ ] The images remain understandable under responsive cropping.
- [ ] No scene implies medical diagnosis, medication use, or guaranteed outcomes.
- [ ] The images are described internally as generated marketing visuals, not customer testimonials.
- [ ] Original generation files and prompts are retained as provenance records.

# Recommended website-ready exports

After approving the full-resolution PNG outputs:

1. Export WebP versions at quality 82 to 88.
2. Keep the original PNG files outside the production bundle as masters.
3. Target approximately 250 to 500 KB per WebP when visual quality allows.
4. Preserve embedded color profile consistency, preferably sRGB.
5. Do not repeatedly recompress JPEG or WebP files.
6. Use these project paths for the approved final assets:
   - `src/assets/images/planJourney/start-generated-v1.webp`
   - `src/assets/images/planJourney/see-the-rep-generated-v1.webp`
   - `src/assets/images/planJourney/keep-going-generated-v1.webp`

