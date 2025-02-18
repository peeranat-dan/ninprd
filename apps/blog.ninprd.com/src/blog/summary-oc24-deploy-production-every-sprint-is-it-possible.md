---
title: "สรุป OC24: Deploy Production every sprint!? Is it possible?"
excerpt: มาอย่างต่อเนื่องกับอีก Session ที่สนุกเพราะแปะมีมตลอดทางกับ Deploy Production every sprint!? Is it possible? ใน ODDS| CONF 2024 ซึ่งเอาตรง ๆ ตอนนิลอ่านหัวข้อครั้งแรกนิลก็แบบ มันจะเป็นไปได้หรอวะ ส่งของให้ User ใช้ Sprint ละครั้ง แต่สำหรับพี่จี๊บแห่ง ODDS| กับทีมของเขาแล้ว มันเป็นไปได้ครับ ทีมพี่เขาทำได้วิธีไหน มารู้ไปพร้อม ๆ กันครับ
tags:
  - conference
  - OC24
  - ODDSCONF24
  - summary
featuredImage: assets/blog-deploy-prod.webp
date: 2024-11-22
status: published
---
มาอย่างต่อเนื่องกับอีก Session ที่สนุกเพราะแปะมีมตลอดทางกับ Deploy Production every sprint!? Is it possible? ใน ODDS| CONF 2024 ซึ่งเอาตรง ๆ ตอนนิลอ่านหัวข้อครั้งแรกนิลก็แบบ มันจะเป็นไปได้หรอวะ ส่งของให้ User ใช้ Sprint ละครั้ง แต่สำหรับพี่จี๊บแห่ง ODDS| กับทีมของเขาแล้ว มันเป็นไปได้ครับ ทีมพี่เขาทำได้วิธีไหน มารู้ไปพร้อม ๆ กันครับ

1. สิ่งที่จะพี่ิจี๊บเล่าต่อไปนี้เป็นแค่ประสบการณ์ที่พี่เขาเจอ ไม่ได้แปลว่าใช้ได้กับทุกที่ แค่มาเล่าสู่กันฟัง
2. ทีมทำ Product Jago มี Active User 14M คน มีทีมย่อยข้างใน 3 ทีม
3. ทีมทำงานกันในรูปแบบ [LeSS](https://less.works/) แต่ยังไม่ Fully LeSS (ขอแรกตัวเองว่ายังเป็น LeSS Practitioner)
4. ด้วยวิธีการทำงานแบบ LeSS ทำให้เกิดการกระจาย Knowledge ทั้งทีม
5. วิธี Development ที่เลือกใช้คือ [Trunk-Based Development](https://trunkbaseddevelopment.com/) ก็คือทุก ๆ คนทำงานกันที่ Branch Main/Master เพื่อให้ทุก ๆ คนได้ Code ที่อัปเดทและ Stable อยู่เสมอ
6. แล้วเมื่อไหร่เราจะกล้าเอาของขึ้น Branch Master/Main ล่ะ ก็คือเราต้องเขียน Test Coverage ไว้ 100%
7. แต่เอาจริง ๆ Test Coverage 100% ยากมาก เอาเป็นว่าถ้าเราสามารถนอนหลับสนิทได้โดยไม่ต้องพะวงว่า Code เราจะไปบึ้มบน Production หรือเปล่า = Coverage ดีแล้ว 55555
8. เวลาจะทำ Feature เพิ่ม ต้องคิดเผื่อ Backward Compatibility เช่น มือถือเครื่องเก่า ๆ ยังต้องใช้งานได้
9. สิ่งหนึ่งที่สามารถช่วยทำ Backward Compatibility ได้คือการทำ Feature Toggle (หรือที่ชาวบ้านเรียกกันว่า Feature Flag)
10. เสร็จแล้วจะมี Process ในการ Deploy ขึ้น Staging เพื่อให้ QA ทำ Regression Testing ต่อไป
11. เมื่อ QA นั่งทำ Manual Regression Testing เสร็จ แต่ละทีมก็ต้องส่งคนไปประสานกับ QA ว่า Feature ที่แต่ละทีมทำไปมี Bug อะไรไหม
12. พอ Regression Testing เยอะ ๆ และนั่งทำกัน Manual เกิด Pain ขึ้นทำให้ทีมเริ่มทำ Automation E2E Testing กันเพื่อช่วยลด Pain ให้ QA
13. ทีมคุยงานกันผ่าน [gather.town](https://www.gather.town/) ทำให้ทีมเอาผลการทำ E2E Testing มา Integrate กับ gather ให้ต้นไม้ 1 ต้น = 1 Case ถ้า Pass ต้นไม้เป็นสีเขียว ถ้า Fail ต้นไม้เป็นสีแดง
14. หลัง Test เสร็จก็จะยิง Meeting ที่ชื่อว่า “Go/No-Go Meeting” เพื่อมาคุยร่วมกันว่าของที่จะเอาขึ้นมีอะไรบ้างและของที่จะเอาขึ้นมี Known Issues อะไรบ้าง เพื่อตัดสินใจว่าจะ Go (Deploy ขึ้น Production) หรือ No-Go (ยังไม่ Deploy)
15. นอกจากนี้ยังคุยกันถึงวัน Deploy ด้วยเพื่อหลีกเลี่ยงวันที่อาจจะมี Traffic เข้ามาเยอะ เช่น ไม่ Deploy ช่วงสงกรานต์
16. ถ้ามี Known Issues ที่ Product Owner ยอมรับได้ ทุกคนโอเคหมด ก็ Let’s Go เข้า Process เอาขึ้น Prod ละะ
17. ในขั้นตอนการ Deploy ตอนแรกใช้ GitLab CI แต่ทีมเจอ Tool ที่ดีกว่านั่นคือ Harness
18. ดีกว่ายังไง? ดีกว่าเพราะสามารถทำ Canary Deployment ได้
19. แล้ว Canary Deployment คืออะไร มันคือการ Deploy App เราไปใช้ User แค่กลุ่มนึงใช้ก่อน แล้วพอเราได้ Feedback จาก User กลุ่มนั้นมาแล้วว่า App ทำงานได้ปกติ เราก็จะ Deploy App ไปให้ User ที่เหลือใช้
20. Process ที่เล่ามาจะใช้เวลาประมาณ 8 วันทำการ นานที่ Regression Testing
21. ปัจจัยที่ทำให้เกิดการ Deploy Prod ทุก Sprint ได้คือการที่คิดเผื่อ Backward Compatibility, การมี Team Collaboration, การ Share Knowledge กันในทีม, การมี Test Coverage และ Regression Testing, มีการ Monitor กันและการทำ Canary Deployment
22. พี่จี๊บเล่าให้ฟังว่าปีนึงแล้วจะเกิดเหตุการณ์ No-Go ขึ้นปี 2-3 ครั้ง ซึ่งจะเกิดขึ้นเมื่อ Known Issue นั้นใหญ่มากจน Product Owner ไม่ปล่อยผ่าน

ฟังแล้วแบบ Inspired มาก อยากเอาของขึ้น Production ทุก Sprint เลย 55555