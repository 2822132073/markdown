官方给出的model的相关模板只涉及一些简单的操作,如果需要对表做一些复杂的查询,则需要对方法进行自定义,下面给出自定义的步骤,官方生成的一共有3个文件,分别是

- *model.go
- *model_gen.go
- vars.go

第二个文件中包含着生成的一些简单的方法,这个文件是不可以修改的,我们需要修改的是第一个文件

```go
package users

import (
	"context"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ UsersModel = (*customUsersModel)(nil)

type (
	// UsersModel is an interface to be customized, add more methods here,
	// and implement the added methods in customUsersModel.
	UsersModel interface {
		usersModel
	}

	customUsersModel struct {
		*defaultUsersModel
	}
)

// NewUsersModel returns a model for the database table.
func NewUsersModel(conn sqlx.SqlConn) UsersModel {
	return &customUsersModel{
		defaultUsersModel: newUsersModel(conn),
	}
}

```

​	这个文件是原本的文件,根据提示我们知道我们需要在`UsersModel`接口之中添加接口,这个接口里面原本就有一个匿名接口`usersModel`,这个接口存在于之前那个生成的文件里面,这个接口已经被`defaultUsersModel`实现,既然我们的这个`UsersModel`也包含了这个接口,所以我们也包含它其中的方法

​	再可以看到这个下面有一个定义的`customUsersModel`,里面包含了`defaultUsersModel`,也就是上面提到的实现`usersModel`的结构体,`customUsersModel`包含了它,所以说相当于`customUsersModel`也实现了`defaultUsersModel`

​	然而,根据`NewUsersModel`可以知道,我们返回的是`UserModel`这个接口,所以说,我们需要对这个接口添加方法,然后使用`customUsersModel`实现它

根据上述的逻辑,我们可以这样添加方法,然后实现它

```go
package users

import (
	"context"
	"fmt"
	"github.com/zeromicro/go-zero/core/stores/sqlc"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

var _ UsersModel = (*customUsersModel)(nil)

type (
	// UsersModel is an interface to be customized, add more methods here,
	// and implement the added methods in customUsersModel.
	UsersModel interface {
		usersModel
		Login(ctx context.Context, email, password string) (*Users, error)
	}

	customUsersModel struct {
		*defaultUsersModel
	}
)

func (m *customUsersModel) Login(ctx context.Context, email, password string) (*Users, error) {
	query := fmt.Sprintf("select %s from %s where `email` = ? and `password` = ? limit 1", usersRows, m.table)
	var resp Users
	err := m.conn.QueryRowCtx(ctx, &resp, query, email, password)
	switch err {
	case nil:
		return &resp, nil
	case sqlc.ErrNotFound:
		return nil, ErrNotFound
	default:
		return nil, err
	}
}

// NewUsersModel returns a model for the database table.
func NewUsersModel(conn sqlx.SqlConn) UsersModel {
	return &customUsersModel{
		defaultUsersModel: newUsersModel(conn),
	}
}

```

