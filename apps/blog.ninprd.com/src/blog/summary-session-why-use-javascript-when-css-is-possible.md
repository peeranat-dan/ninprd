---
title: สรุป Session - Why use JavaScript when CSS is possible?
excerpt: สวัสดีครับ วันนี้นิลได้ไปงาน JavaScript Bangkok 2.0.0 มาฮะ เลยลองสรุป Session - Why use JavaScript when CSS is possible? Session ของพี่จุ้นจาก MUI มาแหละ จะเป็นยังไง ลองไปดูกัน
tags:
  - software-engineer
  - conference
  - JavaScript-Bangkok
  - JSBKK2
featuredImage: ./assets/blog-why-use-js-when-css-is-possible.webp
date: 2024-10-20
status: published
---
สวัสดีครับ วันนี้นิลได้ไปงาน [JavaScript Bangkok 2.0.0](https://javascriptbangkok.com/) มาฮะ เลยลองสรุป Session: Why use JavaScript when CSS is possible? Session ของพี่จุ้นจาก [MUI](https://mui.com/) มาแหละ ลองไปดูกัน

พี่จุ้นมาพูดถึงการทำ Reusable Components ครับ ซึ่งการจะทำให้มันดีเนี่ย ต้องมีองค์ประกอบอะไรบ้างกับแต่ละ Stakeholder ซึ่งแต่ละ Stake มีเงื่อนไขแบบนี้

- End Users (ผู้ใช้งานหน้าเว็บ): UI ต้องน่าดึงดูดและโหลดไว
- Business: Implement ไว และ Scale ได้
- Frontend Devs: ไม่ผูกมัดกับ Framework, ใช้ง่าย, Customize ง่าย, Developer Experience ดี

แล้วจากเงื่อนไขเหล่านี้ CSS Method ไหนที่ตอบโจทย์ล่ะ พี่จุ้นมองว่า **CSS Modules + Inline Style** คือ Combo ที่ตอบโจทย์เหล่านี้มากที่สุด

แล้วทำไมถึงเป็นคู่นี้ ต้องอธิบายถึง CSS Modules ก่อนว่า CSS Modules เป็นของที่ Built-in Support ในหลาย ๆ Framework เช่น Next, Nuxt, Solid ซึ่งการใช้งานนั้นก็เป็นเพียงแค่การ Import CSS File เป็น Module แล้วนำไปใช้งานใน File JS แบบนี้ครับ

```css title="button.module.css"
.btn {
	background-color: red;
	padding: 12px 24px;
}
```

```js title="button.jsx"
import * as styles from './button.module.css';

export default function Button() {
	return <button className={styles.btn}>Button</button>
}
```

แต่การทำแบบนี้ก็จะมีปัญหาในเรื่องของการทำ Dynamic Styling ครับ เพราะว่าถ้าเราใช้ CSS Modules แล้ว เราต้องประกาศ CSS rules เป็น combination ของ style ปุ่ม ขนาดของปุ่ม และสีของปุ่ม แปลว่าถ้ามีปุ่ม 4 styles 3 ขนาด และ 4 สี ก็ต้องสร้าง CSS rules ตั้ง 48 rules แหนะ

รวมทั้ง CSS นั้น ยังไม่มีความสามารถในการทำ Tree-Shaking ด้วย ถ้าเราประกาศ CSS rules เยอะ แต่ไม่มีการใช้ = หนักเว็บเล่น ๆ เว็บเราก็จะโหลดช้าอีก

ดังนั้นพี่จุ้นเลยเสนอการเอา Inline Style มาใช้ร่วมกับ CSS Modules โดยมีขั้นตอนตามนี้

1. Template CSS: สร้าง CSS Modules ที่มีแต่ CSS variables ผูกกับ Properties ต่าง ๆ ไว้
```css title="button.module.css"
.btn {
	padding: var(--padding);
	height: var(--height);
}
```
2. สร้าง Function ที่ return CSS variables ตาม style ที่กำหนด
```js title="button-styles.js"
export function buttonSmall() {
	return {
		"--padding": "4px",
		"--height": "32px"
	};
}

export function buttonNormal() {
	return {
		"--padding": "12px 16px",
		"--height": "40px"
	}
}
```
3. inject ใส่ Inline Style
```js title="button.js"
import * as styles from './button.module.css';

export default function Button({style}) {
	return (
		<button className={styles.btn} styles={style}>
			Button
		</button>
	);
}
``` 
4. Import ไปใช้งานแค่นี้ก็เสร็จละ
```js title="page/home.js"
import { ButtonSmall } from "../components/button/button-styles.js";
import Button from "../components/button/button.js"

export default function HomePage() {
	return (
		<div>
			<Button style={{ ...buttonSmall() }}>Button</Button>
		</div>
	);
}
```

พี่จุ้นขิงด้วยว่าวิธีนี้ Bundle Size สูสีกับ [tailwindcss](https://tailwindcss.com/) แหละะ (อันนี้ว้าวมาก) นอกจากนี้พี่จุ้นก็ย้ำอีกครั้งว่าวิธีนี้

1. ใช้ได้กับทุก Framework
2. Style ที่ไม่ได้ถูก import มาใช้ = ถูก Tree-Shaking
3. ง่ายต่อการ extend ทุกอย่างจัดการผ่าน style attribute
4. มี auto complete ให้ใช้กับ key ของ style
5. ใกล้เคียงกับ Native CSS และ JavaScript มาก

สุดท้ายตอนนี้พี่จุ้นกำลังทดลองเพิ่มเติมอยู่ว่าวิธีนี้ใช้ได้ในระดับ production grade ไหมแหละครับ ต้องมาลุ้นกันครับ

ถ้าใครพลาด Session นี้ในวันนี้ไปไม่ต้องห่วงนะครับ เดี๋ยวมี Live ย้อนหลังให้ชมกันครับ ติดตามกันได้ที่เพจ Facebook: [JavaScript Bangkok](https://www.facebook.com/javascriptbangkok) ได้เลยครับ วันนี้นิลหนีไปนอนก่อน สวัสดีครับ 😴💤