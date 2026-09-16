# Промпты для изображений залов

Собраны из `tools/photos.json`: у каждого промпта своя сцена и общий хвост про
здание и камеру — он и делает серию похожей на съёмку одного аквариума.

Автоматически серию делает `tools/generate-halls.ps1` (FLUX.1 schnell через
AI Horde). Этот файл — для ручной генерации в другом сервисе.

## Как получить «одно здание»

1. Пропорция **4:3**, горизонтальная.
2. Сначала сгенерировать **зал 1** и выбрать удачный вариант.
3. Для залов 2–12 приложить этот кадр как референс и дописать в начало промпта:
   `Same building, same interior design, materials, lighting and camera as the reference photo.`
   Генератор тогда держит стены, пол, потолок и свет, меняя только экспонат.
4. Отбраковывать кадры с надписями, логотипами, лицами и «коллажами».
5. Сохранить под именами залов (`edge.png`, `pressure.png` …) в `tools/photos-raw/`
   и запустить `tools/prepare-photos.ps1` — он обрежет в 4:3, сведёт цвет серии
   и разложит по размерам.

## Зал 1 · Граница света — `edge`

```
A long dark museum gallery whose floor is divided across its full width, from wall to wall, by a single thin glowing cyan line. On the near side of the line, under a soft shaft of pale blue-green light falling from a slot in the ceiling, the floor is covered with lush realistic models of seagrass, kelp and green algae. Beyond the line the floor is bare dark sand and stone where nothing grows at all, fading into darkness. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 2 · Давление — `pressure`

```
A dark exhibition room with an industrial hydraulic press in the middle: a massive steel frame with a thick piston pressing down into a transparent cylindrical pressure chamber, and inside the chamber a white styrofoam cup shrunk to the size of a thimble. On a black shelf beside the press stand a normal-size white styrofoam cup and a row of tiny crushed cups for comparison. A few visitors seen from behind watch from a low railing, a single spotlight from above. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 3 · Удильщик — `anglerfish`

```
A small realistic life-size model of a deep-sea anglerfish, only 20 centimeters long: a round black body, a wide open mouth with long needle-like transparent fangs, tiny eyes, and a thin stalk on its forehead ending in a small glowing bulb lure. It is displayed at eye level inside a small glass cube the size of a shoebox on a slim black pedestal in a dark gallery, lit from below by a narrow cyan spotlight, subtle reflections on the glass. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 4 · Биолюминесценция — `glow`

```
A pitch-dark exhibition hall lit only by the exhibits themselves: about forty realistic models of different deep-sea creatures hang at different heights on invisible wires — jellyfish, comb jellies with shimmering rainbow rows, lanternfish with rows of blue light dots, a glowing squid, a long siphonophore chain — each glowing in its own way, in blue, cyan, green and violet. One visitor seen from behind as a dark silhouette. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 5 · Морской снег — `snow`

```
A tall floor-to-ceiling transparent water column in the center of a dark hall, filled with slowly sinking white particles like falling snow, lit from the top by a narrow beam of light. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 6 · Голоса глубины — `voices`

```
A dark listening room with curved acoustic wall panels, several pairs of headphones hanging on thin cables above small round glowing pedestals, a faint projection of a sperm whale on the far wall. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 7 · Полная темнота — `blackout`

```
A narrow entrance to a completely dark room, the doorway outlined only by a faint thin line of cyan light, everything beyond the doorway pitch black. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 8 · Гигантский кальмар — `squid`

```
A realistic twelve-meter giant squid model suspended high in a tall dark atrium, long tentacles hanging down, lit by cold cyan spotlights, a visitor seen from behind far below for scale. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 9 · Батискаф «Триест» — `trieste`

```
A half-scale replica of the Trieste bathyscaphe displayed on a black plinth in a dark hall: a long cylindrical grey steel float on top and a thick spherical steel crew cabin underneath with a small round porthole and an open round entry hatch. A short metal staircase with a railing leads up to the open hatch so visitors can step inside, warm dim light glows from inside the cramped sphere, the replica lit by spotlights. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 10 · Чёрные курильщики — `smokers`

```
A large diorama of hydrothermal black smoker chimneys behind a curved acrylic window, dark mineral towers releasing plumes of black shimmering water, clusters of white tube worms with red tips at their base, lit in cold cyan. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 11 · Живая колония — `colony`

```
A heavy stainless steel pressure chamber with a thick round glass porthole glowing with faint cyan light from inside, pipes, valves and cables around it, standing in a dark laboratory-style exhibition room. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```

## Зал 12 · Чего мы не знаем — `unknown`

```
A visitor seen from behind standing in front of a huge wall-sized panel that is almost entirely smooth blank matte white, filling the whole wall from floor to ceiling. Only a few narrow ribbon-shaped strips run across the white panel, and inside those strips the surface is sculpted in fine detailed relief of undersea ridges, canyons and trenches, lit with glowing cyan light. There are no continents and no coastlines anywhere, no map of the land, no labels — just the empty white surface and the few sculpted strips. Photographed inside the same modern public aquarium and deep-sea museum building: matte black walls, dark polished concrete floor with soft reflections, low black ceiling with thin recessed cyan LED light lines, large curved acrylic windows and glass cases, dim blue-cyan ambient light, clean minimal architecture. Realistic documentary interior photograph, shot on a full-frame camera with a 24mm lens at eye level, f/2.8, ISO 3200, natural sensor grain, true-to-life colors. No signage, no text, no letters, no numbers, no logos, no watermark.
```
